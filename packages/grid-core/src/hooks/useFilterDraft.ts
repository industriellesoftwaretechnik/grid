import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { useFilterWriter } from '#/hooks/useFilterWriter.ts';

const keyOf = (value: unknown) => JSON.stringify(value ?? null);

interface Draft<T> {
  /** The filter value last seen, as a key. */
  seen: string;
  /** What was typed, shown until the filter changes to something this input did not write. */
  text: T | undefined;
  written: string | undefined;
}

/**
 * The typed text of a filter input that several places show at once, such as the header, the floating filter and the
 * side bar. Typing writes the filter, debounced; a change from elsewhere replaces the text. stored is the filter
 * value from a FilterSubscription.
 */
export function useFilterDraft<TData extends RowData, T>(
  column: GridColumn<TData>,
  stored: unknown,
  toText: (value: unknown) => T,
  toValue: (text: T) => unknown
) {
  const { write, clear } = useFilterWriter(column);
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
      write(value);
    },
    clear: () => {
      setDraft((current) => ({ ...current, text: undefined, written: undefined }));
      clear();
    },
  };
}
