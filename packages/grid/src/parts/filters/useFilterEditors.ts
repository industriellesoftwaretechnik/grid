import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { boundsCodec } from '#/parts/filters/inputCodecs.ts';
import { setFilterModel, setFilterOptions } from '#/parts/filters/setFilter.ts';
import { useFilterInput, type DraftInput } from '#/parts/filters/useDraftInput.ts';

export interface RangeFilterModel extends DraftInput<[string, string]> {
  /** For a number filter, the smallest and largest value among the rows the other filters let through. */
  placeholders: [string, string] | undefined;
}

/**
 * The editor of a `number` or `date` filter: two inputs for the bounds, either of which may stay empty. `text` and
 * `change` take both inputs' text.
 */
export function useRangeFilter<TData extends RowData>(
  column: GridColumn<TData>,
  type: 'number' | 'date'
): RangeFilterModel {
  const codec = boundsCodec(type);
  const input = useFilterInput(column, codec);
  const range = useGridSelector(column.table, () => (type === 'number' ? column.getFacetedMinMaxValues() : undefined));
  return { ...input, placeholders: range && codec.toText(range) };
}

/** The editor of a `set` filter: a search over the column's values and a checkbox for each, with select all. */
export function useSetFilter<TData extends RowData>(column: GridColumn<TData>) {
  const [query, setQuery] = useState('');
  const { options, value } = useGridSelector(column.table, () => ({
    options: setFilterOptions(column),
    value: column.getFilterValue(),
  }));

  return {
    ...setFilterModel(column, options, value, query),
    query,
    setQuery,
    canClear: value !== undefined,
  };
}

/** What `useSetFilter` gives a `set` filter editor. */
export type SetFilterModel = ReturnType<typeof useSetFilter>;
