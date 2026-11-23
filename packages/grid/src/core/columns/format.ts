import type { CellData, RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/table/types.ts';

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function formatValue<TData extends RowData, TValue extends CellData>(
  value: unknown,
  column: GridColumn<TData, TValue>
): string {
  if (value === null || value === undefined) return '';
  const format = column.columnDef.meta?.formatValue;
  if (format) return format(value);
  if (typeof value === 'number') return numberFormat.format(value);
  if (value instanceof Date) return dateFormat.format(value);
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  return JSON.stringify(value) ?? '';
}

// Counts are numbers whatever the column holds, so the column's own formatter does not apply to them.
export function formatAggregate<TData extends RowData, TValue extends CellData>(
  value: unknown,
  column: GridColumn<TData, TValue>
): string {
  const aggregation = column.columnDef.aggregationFn;
  if (aggregation === 'count' || aggregation === 'uniqueCount') {
    return typeof value === 'number' ? numberFormat.format(value) : '';
  }
  return formatValue(value, column);
}
