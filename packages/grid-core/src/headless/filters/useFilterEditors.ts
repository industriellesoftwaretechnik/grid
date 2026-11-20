import { useId, useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridColumn } from '#/core/types.ts';
import { setFilter } from '#/headless/filters/setFilter.ts';
import { useFilterState, useFilterValue } from '#/headless/filters/useFilterValue.ts';
import { useFilterDraft } from '#/hooks/useFilterDraft.ts';
import { textFilterText, textFilterValue } from '#/logic/filters/filterText.ts';
import { dateRangeText, numberRangeText } from '#/logic/filters/rangeText.ts';

/** The editor of a `text` filter: one input whose text the column must contain. */
export function useTextFilter<TData extends RowData>(column: GridColumn<TData>) {
  'use no memo';
  const value = useFilterValue(column);
  const { text, change, clear } = useFilterDraft(column, value, textFilterText, textFilterValue);
  const { t } = gridMeta(column.table);

  return {
    text,
    change,
    clear,
    canClear: text !== '' || value !== undefined,
    label: t('filter.contains'),
    clearLabel: t('filter.clear'),
  };
}

type Bounds = [string, string];

/** The editor of a `number` or `date` filter: two inputs for the bounds, either of which may stay empty. */
export function useRangeFilter<TData extends RowData>(column: GridColumn<TData>, type: 'number' | 'date') {
  'use no memo';
  const id = useId();
  const value = useFilterValue(column);
  useFilterState(column);
  const { toText, fromText } = type === 'number' ? numberRangeText : dateRangeText;
  const { text, change, clear } = useFilterDraft(
    column,
    value,
    (stored): Bounds => (Array.isArray(stored) ? [toText(stored[0]), toText(stored[1])] : ['', '']),
    ([from, to]: Bounds) => {
      const range = [fromText(from, 0), fromText(to, 1)];
      return range[0] === undefined && range[1] === undefined ? undefined : range;
    }
  );
  const { t } = gridMeta(column.table);
  const labels: Bounds = type === 'number' ? [t('filter.min'), t('filter.max')] : [t('filter.from'), t('filter.to')];
  // A number filter suggests the smallest and largest value among the rows the other filters let through.
  const range = type === 'number' ? column.getFacetedMinMaxValues() : undefined;

  return {
    /** The input type. */
    type,
    bounds: ([0, 1] as const).map((bound) => ({
      /** For the input's `id` and its label's `htmlFor`. */
      id: `${id}-${bound}`,
      label: labels[bound],
      text: text[bound],
      placeholder: range ? toText(range[bound]) : undefined,
      change: (next: string) => change(bound === 0 ? [next, text[1]] : [text[0], next]),
    })),
    clear,
    canClear: text[0] !== '' || text[1] !== '' || value !== undefined,
    clearLabel: t('filter.clear'),
  };
}

/** The editor of a `set` filter: a search over the column's values and a checkbox for each, with select all. */
export function useSetFilter<TData extends RowData>(column: GridColumn<TData>) {
  'use no memo';
  const [query, setQuery] = useState('');
  const value = useFilterValue(column);
  useFilterState(column);
  const { t } = gridMeta(column.table);

  return {
    ...setFilter(column, query),
    query,
    setQuery,
    canClear: value !== undefined,
    searchLabel: t('filter.search-values'),
    selectAllLabel: t('filter.select-all'),
    clearLabel: t('filter.clear'),
  };
}
