import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridColumn } from '#/core/types.ts';
import { columnMeta } from '#/logic/columns/columnInfo.ts';
import { filterSummary } from '#/logic/filters/filterSummary.ts';
import { formatValue } from '#/logic/format.ts';

/** A column's filter value as text, such as `≥ 5` or `(3) a, b, c`; empty when nothing is filtered. */
export function filterSummaryText<TData extends RowData>(column: GridColumn<TData>, value: unknown): string {
  const { filter } = columnMeta(column);
  if (!filter) return '';
  const { t } = gridMeta(column.table);
  return filterSummary(filter, value, {
    format: (item) => formatValue(item, column),
    empty: t('filter.empty'),
    noneSelected: t('filter.none-selected'),
  });
}
