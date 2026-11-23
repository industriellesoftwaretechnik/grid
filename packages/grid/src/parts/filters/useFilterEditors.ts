import { useId, useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { textFilterText, textFilterValue } from '#/parts/filters/filterText.ts';
import { dateRangeText, numberRangeText } from '#/parts/filters/rangeText.ts';
import { setFilterModel, setFilterOptions } from '#/parts/filters/setFilter.ts';
import { useFilterDraft, useFilterValue } from '#/parts/filters/useFilterDraft.ts';

/** The editor of a `text` filter: one input whose text the column must contain. */
export function useTextFilter<TData extends RowData>(column: GridColumn<TData>) {
  const t = useTranslate(column.table);
  const value = useFilterValue(column);
  const { text, change, clear } = useFilterDraft(column, value, textFilterText, textFilterValue);

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
  const id = useId();
  const t = useTranslate(column.table);
  const value = useFilterValue(column);
  // A number filter suggests the smallest and largest value among the rows the other filters let through.
  const range = useGridSelector(column.table, () => (type === 'number' ? column.getFacetedMinMaxValues() : undefined));
  const { toText, fromText } = type === 'number' ? numberRangeText : dateRangeText;
  const { text, change, clear } = useFilterDraft(
    column,
    value,
    (stored): Bounds => (Array.isArray(stored) ? [toText(stored[0]), toText(stored[1])] : ['', '']),
    ([from, to]: Bounds) => {
      const bounds = [fromText(from, 0), fromText(to, 1)];
      return bounds[0] === undefined && bounds[1] === undefined ? undefined : bounds;
    }
  );
  const labels: Bounds = type === 'number' ? [t('filter.min'), t('filter.max')] : [t('filter.from'), t('filter.to')];

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
  const [query, setQuery] = useState('');
  const t = useTranslate(column.table);
  const { options, value } = useGridSelector(column.table, () => ({
    options: setFilterOptions(column),
    value: column.getFilterValue(),
  }));

  return {
    ...setFilterModel(column, options, value, query),
    query,
    setQuery,
    canClear: value !== undefined,
    searchLabel: t('filter.search-values'),
    selectAllLabel: t('filter.select-all'),
    clearLabel: t('filter.clear'),
  };
}

/** What `useTextFilter` gives a `text` filter editor. */
export type TextFilterModel = ReturnType<typeof useTextFilter>;
/** What `useRangeFilter` gives a `number` or `date` filter editor. */
export type RangeFilterModel = ReturnType<typeof useRangeFilter>;
/** What `useSetFilter` gives a `set` filter editor. */
export type SetFilterModel = ReturnType<typeof useSetFilter>;
