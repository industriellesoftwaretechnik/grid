import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import { useDebouncedCallback } from '#/core/shared/useDebouncedCallback.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { textCodec, type InputCodec } from '#/parts/filters/inputCodecs.ts';

/** An input that writes to the table as the user types; a change from elsewhere replaces its text. */
export interface DraftInput<T> {
  /** The typed text, else the value as text. */
  text: T;
  /** Shows the text at once and writes its value 300 ms after typing stops; unreadable text is not written. */
  change: (text: T) => void;
  /** Clears the text and the value at once, without the pause. */
  clear: () => void;
  /** The text cannot be read, so the value before it stays. */
  invalid: boolean;
  /** The text or the value is set. */
  canClear: boolean;
}

const keyOf = (value: unknown) => JSON.stringify(value ?? null);

interface Draft<T> {
  seen: string;
  /** Shown until the value changes to something this input did not write. */
  text: T | undefined;
  written: string | undefined;
}

// Other places, such as "Clear filters", may change the value too; a change from elsewhere replaces the text.
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

/** An input for the column's filter value; `codec` must keep its identity. */
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

/** The input for the table's search, its global filter. */
export function useSearch<TData extends RowData>(table: CoreTable<TData>): DraftInput<string> {
  return useDraftInput(
    table,
    () => table.atoms.globalFilter.get(),
    (value) => table.setGlobalFilter(value),
    textCodec
  );
}
