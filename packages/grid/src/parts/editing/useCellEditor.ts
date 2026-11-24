import { createElement, useEffect, useId, useState, type KeyboardEvent, type MouseEvent } from 'react';

import type { RowData } from '@tanstack/react-table';

import { editorKindOf, editorOptions, parseCellText } from '#/core/columns/columnEditor.ts';
import { columnLabel } from '#/core/columns/columnInfo.ts';
import { matchingOptions, toEditorText } from '#/core/columns/editorValue.ts';
import { formatValue } from '#/core/columns/format.ts';
import { displayedColumns, displayedRowIds } from '#/core/selection/gridCells.ts';
import { moveFocus } from '#/core/selection/navigation.ts';
import type { GridCell } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** `rule` carries the column's validation message; the others are text the editor cannot read as that type. */
export type CellEditorError = { type: 'number' | 'date' | 'option' } | { type: 'rule'; message: string };

/** A choice of a select editor. */
export interface EditorChoice {
  value: unknown;
  label: string;
  /** It is the cell's value. */
  current: boolean;
}

const stop = (event: MouseEvent) => {
  // Keeps the focus in the input and the cell's own handlers out of it; the list may sit in a portal.
  event.preventDefault();
  event.stopPropagation();
};

/**
 * The editor of the cell being edited: an input, a select with choices, or the column's own editor. Enter and Tab
 * commit, Escape cancels; blur commits valid typed text and cancels otherwise, and always cancels a select.
 */
export function useCellEditor<TData extends RowData>(cell: GridCell<TData>) {
  const { table, column } = cell;
  const kind = editorKindOf(column);
  const isSelect = kind === 'select';
  const { value, options } = useGridSelector(table, () => ({
    value: cell.getValue(),
    options: isSelect ? editorOptions(column) : [],
  }));
  // The key that started the edit replaces the text of an input and searches a select; a date input cannot take it.
  const [initialText] = useState(() => (kind === 'date' ? undefined : table.getEditingCell()?.initialText));
  const [text, setText] = useState(() => initialText ?? (isSelect ? '' : toEditorText(value, kind)));
  const [error, setError] = useState<CellEditorError>();
  const listId = useId();
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const editor = column.columnDef.meta?.editor;

  const format = (option: unknown) => formatValue(option, column);
  const isCurrent = (option: unknown) =>
    option === value || (option !== null && value !== null && value !== undefined && format(option) === format(value));
  const choices: EditorChoice[] = isSelect
    ? [
        ...(text.trim() === '' ? [{ value: null, label: '–', current: value === null || value === undefined }] : []),
        ...matchingOptions(options, text, format).map((option) => ({
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
    if (!input) return;
    input.focus();
    if (initialText === undefined && input.type === 'text') input.select();
  }, [input, initialText]);

  const commit = (next: unknown): string | undefined => {
    const message = cell.setValue(next);
    if (message === undefined) table.stopEditing();
    else setError({ type: 'rule', message });
    return message;
  };
  const commitText = (typed: string): boolean => {
    const parsed = parseCellText(column, typed);
    if ('error' in parsed) {
      setError({ type: parsed.error });
      return false;
    }
    return commit(parsed.value) === undefined;
  };
  const commitChoice = (index: number): boolean => {
    const choice = choices[index];
    if (!choice) {
      setError({ type: 'option' });
      return false;
    }
    return commit(choice.value) === undefined;
  };
  const commitEdit = () => (isSelect ? commitChoice(activeIndex) : commitText(text));
  const moveAfterTab = (backwards: boolean) => {
    const next = moveFocus(
      displayedRowIds(table),
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
    /** The input element once mounted; a select's choices are placed under it. */
    input,
    /** The column's `meta.editor` component, rendered instead of the input; unset without one. */
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
    /** Why the last commit failed; cleared when the text changes. */
    error,
    /** Props for the `<input>` element; for `select`, it is the combobox. */
    inputProps: {
      ref: setInput,
      type: kind === 'date' ? 'date' : 'text',
      inputMode: kind === 'number' ? ('decimal' as const) : undefined,
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
    /** For `select`: a choice for no value comes first while the text is empty. */
    choices,
    /** For `select`: the choice Enter picks. */
    activeIndex,
    /** Props for the list of choices. */
    listProps: { id: listId, role: 'listbox' as const, 'aria-label': columnLabel(column), onMouseDown: stop },
    /** Props for the choice at `index`; a click commits it. */
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

/** What `useCellEditor` returns. */
export type CellEditorModel = ReturnType<typeof useCellEditor>;
