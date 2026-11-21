import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridColumn } from '#/core/types.ts';
import { useFilterValue } from '#/headless/filters/useFilterValue.ts';
import { useFilterDraft } from '#/hooks/useFilterDraft.ts';
import { columnLabel, columnMeta, filterKindOf } from '#/logic/columns/columnInfo.ts';
import { filterSummary } from '#/logic/filters/filterSummary.ts';
import { filterSummaryText } from '#/logic/filters/filterSummaryText.ts';
import { parseNumberRange, textFilterText, textFilterValue } from '#/logic/filters/filterText.ts';

/**
 * The button in a header that opens the column's filter editor, for the filter kind `filter`. Unavailable where the
 * column cannot be filtered.
 */
export function useColumnFilterButton<TData extends RowData>(column: GridColumn<TData>) {
  'use no memo';
  const value = useFilterValue(column);
  const { align } = columnMeta(column);

  return {
    filter: filterKindOf(column),
    filtered: value !== undefined,
    /** The button sits on the side away from the label: left in right-aligned headers. */
    side: align === 'end' ? ('start' as const) : ('end' as const),
    label: gridMeta(column.table).t('filter'),
  };
}

const plainNumber = new Intl.NumberFormat(undefined, { useGrouping: false, maximumFractionDigits: 10 });
const numberText = (value: unknown) =>
  filterSummary('number', value, {
    format: (bound) => (typeof bound === 'number' ? plainNumber.format(bound) : ''),
    empty: '',
    noneSelected: '',
  });

/**
 * The filter in the row under the header, as in AG Grid. `typed` for text and numbers, which are typed in, numbers
 * also as `≥ 5` or `5 – 10`; `summary` for dates and sets, which show their filter as text and open the full editor;
 * `none` where the column cannot be filtered.
 */
export function useFloatingFilter<TData extends RowData>(column: GridColumn<TData>) {
  'use no memo';
  const value = useFilterValue(column);
  const [open, setOpen] = useState(false);
  const filter = filterKindOf(column);
  const isNumber = filter === 'number';
  const toValue = isNumber ? parseNumberRange : textFilterValue;
  const { text, change } = useFilterDraft(column, value, isNumber ? numberText : textFilterText, toValue);
  const { t } = gridMeta(column.table);
  const mode = filter === undefined ? 'none' : filter === 'text' || isNumber ? 'typed' : 'summary';

  return {
    mode,
    filter,
    label: `${t('filter')}: ${columnLabel(column)}`,
    /** For `typed`: the text, and whether it cannot be read as a filter. */
    text,
    change,
    invalid: mode === 'typed' && toValue(text) === null,
    hint: isNumber ? t('filter.number-hint') : undefined,
    /** For `summary`: the filter as text, and whether its editor is open. */
    summary: filterSummaryText(column, value),
    open,
    setOpen,
  };
}
