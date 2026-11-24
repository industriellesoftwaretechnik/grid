import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { boundsCodec } from '#/parts/filters/inputCodecs.ts';
import { setFilterModel, setFilterOptions } from '#/parts/filters/setFilter.ts';
import { useFilterInput, type DraftInput } from '#/parts/filters/useDraftInput.ts';

/** What `useRangeFilter` returns. */
export interface RangeFilterModel extends DraftInput<[string, string]> {
  /** For a number filter, the min and max among the rows the other filters let through; unset for a date filter. */
  placeholders: [string, string] | undefined;
}

/** The full editor of a number or date range filter, with a from and a to input; `text` and `change` take both. */
export function useRangeFilter<TData extends RowData>(
  column: GridColumn<TData>,
  type: 'number' | 'date'
): RangeFilterModel {
  const codec = boundsCodec(type);
  const input = useFilterInput(column, codec);
  const range = useGridSelector(column.table, () => (type === 'number' ? column.getFacetedMinMaxValues() : undefined));
  return { ...input, placeholders: range && codec.toText(range) };
}

/** The full editor of a set filter: a checkbox per value, searchable by `query`. */
export function useSetFilter<TData extends RowData>(column: GridColumn<TData>) {
  const [query, setQuery] = useState('');
  const { options, value } = useGridSelector(column.table, () => ({
    options: setFilterOptions(column),
    value: column.getFilterValue(),
  }));

  return {
    ...setFilterModel(column, options, value, query),
    /** The search text over the option labels. */
    query,
    setQuery,
    /** The column is filtered. */
    canClear: value !== undefined,
  };
}

/** What `useSetFilter` returns. */
export type SetFilterModel = ReturnType<typeof useSetFilter>;
