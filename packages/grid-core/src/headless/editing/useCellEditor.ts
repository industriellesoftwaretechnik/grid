import { createElement, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridCell } from '#/core/types.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { editorKindOf, editorOptions, parseCellText } from '#/logic/editing/columnEditor.ts';
import { matchingOptions, toEditorText } from '#/logic/editing/editorValue.ts';
import { displayedColumns, displayedRows } from '#/logic/focus/gridCells.ts';
import { moveFocus } from '#/logic/focus/navigation.ts';
import { formatValue } from '#/logic/format.ts';

/** A choice of a `select` editor. */
export interface EditorChoice {
  value: unknown;
  label: string;
  /** Whether it is the cell's value. */
  current: boolean;
}

const stop = (event: MouseEvent) => {
  // Keeps the focus in the input and the cell's own handlers out of it; the list may sit in a portal.
  event.preventDefault();
  event.stopPropagation();
};

/**
 * The editor inside an edited cell: an input for `text`, `number` and `date`, the column's own editor (`custom`), and
 * for `select` an input that searches the choices listed under it. Enter and Tab commit, Escape cancels, leaving a
 * typed value commits it if valid and leaving a select keeps the value. In a select, the arrow keys move through the
 * choices and a click picks one.
 */
export function useCellEditor<TData extends RowData>(cell: GridCell<TData>) {
  'use no memo';
  const { table, column } = cell;
  const { t } = gridMeta(table);
  const kind = editorKindOf(column);
  const isSelect = kind === 'select';
  const value = cell.getValue();
  // The key that started the edit replaces the text of an input and searches a select; a date input cannot take it.
  const [initialText] = useState(() => (kind === 'date' ? undefined : table.getEditingCell()?.initialText));
  const [text, setText] = useState(() => initialText ?? (isSelect ? '' : toEditorText(value, kind)));
  const [error, setError] = useState<string>();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const editor = column.columnDef.meta?.editor;

  const format = (option: unknown) => formatValue(option, column);
  const isCurrent = (option: unknown) =>
    option === value || (option !== null && value !== null && value !== undefined && format(option) === format(value));
  const choices: EditorChoice[] = isSelect
    ? [
        ...(text.trim() === '' ? [{ value: null, label: '–', current: value === null || value === undefined }] : []),
        ...matchingOptions(editorOptions(column), text, format).map((option) => ({
          value: option,
          label: format(option),
          current: isCurrent(option),
        })),
      ]
    : [];
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      choices.findIndex((choice) => choice.current)
    )
  );
  const activeIndex = Math.min(active, choices.length - 1);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (initialText === undefined && input.type === 'text') input.select();
  }, [initialText]);

  const commit = (next: unknown): string | undefined => {
    const message = cell.setValue(next);
    if (message === undefined) table.stopEditing();
    else setError(message);
    return message;
  };
  const commitText = (typed: string): boolean => {
    const parsed = parseCellText(column, typed);
    if ('error' in parsed) {
      setError(t(`edit.invalid-${parsed.error}`));
      return false;
    }
    return commit(parsed.value) === undefined;
  };
  const commitChoice = (index: number): boolean => {
    const choice = choices[index];
    if (!choice) {
      setError(t('edit.invalid-option'));
      return false;
    }
    return commit(choice.value) === undefined;
  };
  const commitEdit = () => (isSelect ? commitChoice(activeIndex) : commitText(text));
  const moveAfterTab = (backwards: boolean) => {
    const next = moveFocus(
      displayedRows(table).map((row) => row.id),
      displayedColumns(table).map((candidate) => candidate.id),
      { rowId: cell.row.id, columnId: column.id },
      backwards ? 'previous' : 'next',
      0
    );
    if (next) table.setFocusedCell(next.rowId, next.columnId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // The grid's own keys must not act on the text being edited.
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      table.stopEditing();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      commitEdit();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      if (commitEdit()) moveAfterTab(event.shiftKey);
    } else if (isSelect && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(Math.min(Math.max(activeIndex + step, 0), choices.length - 1));
    }
  };
  const onBlur = () => {
    if (table.getEditingCell() === null) return;
    if (isSelect || !commitText(text)) table.stopEditing();
  };
  const activeId = activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;

  return {
    kind,
    /** The column's own editor, rendered instead of the input. */
    custom:
      typeof editor === 'function'
        ? createElement(editor, {
            value,
            initialText,
            commit,
            cancel: () => table.stopEditing(),
            row: cell.row.original,
          })
        : undefined,
    /** The validation message, shown until the text changes. */
    error,
    inputProps: {
      ref: inputRef,
      type: kind === 'date' ? 'date' : 'text',
      inputMode: kind === 'number' ? ('decimal' as const) : undefined,
      'aria-label': t('edit.value'),
      'aria-invalid': error !== undefined,
      value: text,
      onKeyDown,
      onBlur,
      onChange: (event: { target: { value: string } }) => {
        setText(event.target.value);
        setError(undefined);
        setActive(0);
      },
      ...(isSelect && {
        role: 'combobox' as const,
        placeholder: value === null || value === undefined ? undefined : format(value),
        autoComplete: 'off',
        'aria-autocomplete': 'list' as const,
        'aria-expanded': true,
        'aria-controls': listId,
        'aria-activedescendant': activeId,
      }),
    },
    /** For `select`: the choices that match the text, an empty one for no value first while there is none. */
    choices,
    /** For `select`: the choice Enter picks, to highlight and keep in view. */
    activeIndex,
    /** For `select`: the props of the list holding the choices. */
    listProps: { id: listId, role: 'listbox' as const, 'aria-label': columnLabel(column), onMouseDown: stop },
    /** For `select`: the props of a choice's element. */
    choiceProps: (index: number) => ({
      id: `${listId}-${index}`,
      role: 'option' as const,
      'aria-selected': index === activeIndex,
      onMouseDown: stop,
      onPointerMove: () => {
        if (index !== activeIndex) setActive(index);
      },
      onClick: (event: MouseEvent) => {
        event.stopPropagation();
        commitChoice(index);
      },
    }),
  };
}
