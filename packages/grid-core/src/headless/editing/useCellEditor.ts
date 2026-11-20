import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridCell } from '#/core/types.ts';
import { toEditorText, type EditorKind } from '#/logic/editing/editorValue.ts';
import {
  displayedColumns,
  displayedRows,
  editorKindOf,
  editorOptions,
  parseCellText,
} from '#/logic/focus/gridCells.ts';
import { moveFocus } from '#/logic/focus/navigation.ts';
import { formatValue } from '#/logic/format.ts';

/**
 * The editor inside an edited cell: an input for `text`, `number` and `date`, a select for `select`, or the column's
 * own editor (`custom`). Enter and Tab commit, Escape cancels, leaving it commits a valid value.
 */
export function useCellEditor<TData extends RowData>(cell: GridCell<TData>) {
  'use no memo';
  const { table, column } = cell;
  const { t } = gridMeta(table);
  const kind: EditorKind = editorKindOf(column);
  // A typed key replaces the value in text inputs; a select or a date input cannot start from it.
  const [initialText] = useState(() =>
    kind === 'text' || kind === 'number' ? table.getEditingCell()?.initialText : undefined
  );
  const pickedWithPointer = useRef(false);
  const [text, setText] = useState(() => initialText ?? toEditorText(cell.getValue(), kind));
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const editor = column.columnDef.meta?.editor;

  useEffect(() => {
    selectRef.current?.focus();
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (initialText === undefined && input.type === 'text') input.select();
  }, [initialText]);

  const commit = (value: unknown): string | undefined => {
    const message = cell.setValue(value);
    if (message === undefined) table.stopEditing();
    else setError(message);
    return message;
  };
  const commitText = (value: string): boolean => {
    const parsed = parseCellText(column, value);
    if ('error' in parsed) {
      setError(t(`edit.invalid-${parsed.error}`));
      return false;
    }
    return commit(parsed.value) === undefined;
  };
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
    } else if (event.key === 'Enter' && commitText(text)) event.preventDefault();
    else if (event.key === 'Tab') {
      event.preventDefault();
      if (commitText(text)) moveAfterTab(event.shiftKey);
    }
  };
  const onBlur = () => {
    if (table.getEditingCell() !== null && !commitText(text)) table.stopEditing();
  };
  const field = {
    'aria-label': t('edit.value'),
    'aria-invalid': error !== undefined,
    value: text,
    onKeyDown,
    onBlur,
  };

  return {
    kind,
    /** The column's own editor, rendered instead of the input or select. */
    custom:
      typeof editor === 'function'
        ? (editor({
            value: cell.getValue(),
            initialText,
            commit,
            cancel: () => table.stopEditing(),
            row: cell.row.original,
          }) satisfies ReactNode)
        : undefined,
    /** The validation message, shown until the text changes. */
    error,
    inputProps: {
      ...field,
      ref: inputRef,
      type: kind === 'date' ? 'date' : 'text',
      inputMode: kind === 'number' ? ('decimal' as const) : undefined,
      onChange: (event: { target: { value: string } }) => {
        setText(event.target.value);
        setError(undefined);
      },
    },
    selectProps: {
      ...field,
      ref: selectRef,
      onPointerDown: () => {
        pickedWithPointer.current = true;
      },
      // Arrow keys change a closed select on some systems, so only a pick with the pointer commits at once.
      onChange: (event: { target: { value: string } }) => {
        setText(event.target.value);
        if (pickedWithPointer.current) commitText(event.target.value);
      },
    },
    /** The choices of a select, after an empty one for no value. */
    options: editorOptions(column).map((option) => ({ value: String(option), label: formatValue(option, column) })),
  };
}
