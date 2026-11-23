import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { useDebouncedCallback } from '#/core/shared/useDebouncedCallback.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** The column's filter value, re-rendering when it changes. */
export function useFilterValue<TData extends RowData>(column: GridColumn<TData>): unknown {
  return useGridSelector(column.table, () => column.getFilterValue());
}

const keyOf = (value: unknown) => JSON.stringify(value ?? null);

interface Draft<T> {
  /** The filter value last seen, as a key. */
  seen: string;
  /** What was typed, shown until the filter changes to something this input did not write. */
  text: T | undefined;
  written: string | undefined;
}

/**
 * The typed text of a filter input that several places show at once, such as the header's editor and the floating
 * filter. Typing writes the filter, debounced; a change from elsewhere replaces the text. `stored` is the filter value
 * from `useFilterValue`.
 */
export function useFilterDraft<TData extends RowData, T>(
  column: GridColumn<TData>,
  stored: unknown,
  toText: (value: unknown) => T,
  toValue: (text: T) => unknown
) {
  // Closing the popover unmounts the editor; the last keystrokes must still reach the table.
  const write = useDebouncedCallback((value: unknown) => column.setFilterValue(value), gridDefaults.debounceMs, {
    flushOnUnmount: true,
  });
  const storedKey = keyOf(stored);
  const [draft, setDraft] = useState<Draft<T>>({ seen: storedKey, text: undefined, written: undefined });
  if (draft.seen !== storedKey) {
    setDraft({ seen: storedKey, text: storedKey === draft.written ? draft.text : undefined, written: draft.written });
  }

  return {
    text: draft.text ?? toText(stored),
    /** Shows the text and writes its value; `null` from `toValue` means unreadable text, which keeps the filter. */
    change: (text: T) => {
      const value = toValue(text);
      if (value === null) {
        setDraft((current) => ({ ...current, text }));
        return;
      }
      setDraft((current) => ({ ...current, text, written: keyOf(value) }));
      write.run(value);
    },
    clear: () => {
      setDraft((current) => ({ ...current, text: undefined, written: undefined }));
      write.cancel();
      column.setFilterValue(undefined);
    },
  };
}
