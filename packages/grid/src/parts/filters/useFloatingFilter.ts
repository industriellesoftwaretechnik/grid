import type { RowData } from '@tanstack/react-table';

import { columnLabel, filterKindOf } from '#/core/columns/columnInfo.ts';
import { useTranslate } from '#/core/locale/useTranslate.ts';
import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { filterSummary, filterSummaryText } from '#/parts/filters/filterSummary.ts';
import { parseNumberRange, textFilterText, textFilterValue } from '#/parts/filters/filterText.ts';
import { useFilterDraft, useFilterValue } from '#/parts/filters/useFilterDraft.ts';

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
  const t = useTranslate(column.table);
  const value = useFilterValue(column);
  const summary = useGridSelector(column.table, () => filterSummaryText(column, column.getFilterValue()));
  const filter = filterKindOf(column);
  const isNumber = filter === 'number';
  const toValue = isNumber ? parseNumberRange : textFilterValue;
  const { text, change } = useFilterDraft(column, value, isNumber ? numberText : textFilterText, toValue);
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
    /** For `summary`: the filter as text, shown on the button that opens its editor. */
    summary,
  };
}

/** What `useFloatingFilter` gives a column's floating filter. */
export type FloatingFilterModel = ReturnType<typeof useFloatingFilter>;
