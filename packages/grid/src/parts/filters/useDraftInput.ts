import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import { useDebouncedCallback } from '#/core/shared/useDebouncedCallback.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { textCodec, type InputCodec } from '#/parts/filters/inputCodecs.ts';

/** An input over a value of the table, such as a column filter or the search. */
export interface DraftInput<T> {
  /** The typed text, else the value as text. */
  text: T;
  /** Shows the text at once and writes its value after a pause in typing; unreadable text is kept, not written. */
  change: (text: T) => void;
  /** Removes the value and the text at once. */
  clear: () => void;
  /** Whether the text cannot be read, so the value before it stays. */
  invalid: boolean;
  /** Whether there is a value or text to clear. */
  canClear: boolean;
}

const keyOf = (value: unknown) => JSON.stringify(value ?? null);

interface Draft<T> {
  /** The value last seen, as a key. */
  seen: string;
  /** What was typed, shown until the value changes to something this input did not write. */
  text: T | undefined;
  written: string | undefined;
}

/**
 * The typed text of an input that other places may change the value of, such as a header's filter editor, the floating
 * filter and "Clear filters". Typing writes the value, debounced; a change from elsewhere replaces the text.
 */
function useDraftInput<T>(
  table: { gridStore: GridStore },
  read: () => unknown,
  write: (value: unknown) => void,
  codec: InputCodec<T>
): DraftInput<T> {
  const stored = useGridSelector(table, read);
  // Closing a popover unmounts its input; the last keystrokes must still reach the table.
  const debounced = useDebouncedCallback(write, gridDefaults.debounceMs, { flushOnUnmount: true });
  const storedKey = keyOf(stored);
  const [draft, setDraft] = useState<Draft<T>>({ seen: storedKey, text: undefined, written: undefined });
  if (draft.seen !== storedKey) {
    setDraft({ seen: storedKey, text: storedKey === draft.written ? draft.text : undefined, written: draft.written });
  }
  const text = draft.text ?? codec.toText(stored);
  const value = codec.toValue(text);

  return {
    text,
    change: (next) => {
      const nextValue = codec.toValue(next);
      if (nextValue === null) {
        setDraft((current) => ({ ...current, text: next }));
        return;
      }
      setDraft((current) => ({ ...current, text: next, written: keyOf(nextValue) }));
      debounced.run(nextValue);
    },
    clear: () => {
      setDraft((current) => ({ ...current, text: undefined, written: undefined }));
      debounced.cancel();
      write(undefined);
    },
    invalid: value === null,
    canClear: value !== undefined || codec.toValue(codec.toText(stored)) !== undefined,
  };
}

/**
 * An input for a column's filter, with a codec from `inputCodecs`: `textCodec` for a `text` filter, `numberRangeCodec`
 * for a number range typed into one input, `boundsCodec` for two inputs. `codec` must keep its identity.
 */
export function useFilterInput<TData extends RowData, T>(
  column: GridColumn<TData>,
  codec: InputCodec<T>
): DraftInput<T> {
  return useDraftInput(
    column.table,
    () => column.getFilterValue(),
    (value) => column.setFilterValue(value),
    codec
  );
}

/** The input of the search across all columns. */
export function useSearch<TData extends RowData>(table: CoreTable<TData>): DraftInput<string> {
  return useDraftInput(
    table,
    () => table.atoms.globalFilter.get(),
    (value) => table.setGlobalFilter(value),
    textCodec
  );
}
