import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import { useDebouncedCallback } from '#/core/shared/useDebouncedCallback.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface SearchModel {
  /** The typed text; the search across all columns follows it, debounced. */
  text: string;
  change: (text: string) => void;
  label: string;
}

const searchText = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * The search across all columns, for a toolbar input. A search set elsewhere, such as cleared with all filters,
 * replaces the typed text.
 */
export function useSearch<TData extends RowData>(table: CoreTable<TData>): SearchModel {
  const t = useTranslate(table);
  const stored = useGridSelector(table, () => searchText(table.atoms.globalFilter.get()));
  // What was typed, shown until the search changes to something this input did not write.
  const [draft, setDraft] = useState({ seen: stored, text: stored, written: stored });
  if (draft.seen !== stored) {
    setDraft({ seen: stored, text: stored === draft.written ? draft.text : stored, written: draft.written });
  }
  const search = useDebouncedCallback((value: string) => table.setGlobalFilter(value), gridDefaults.debounceMs);

  return {
    text: draft.text,
    change: (next) => {
      setDraft((current) => ({ ...current, text: next, written: next }));
      search.run(next);
    },
    label: t('search'),
  };
}
