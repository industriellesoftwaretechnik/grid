import type { CellData, RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/table/types.ts';

interface LocaleFormats {
  number: Intl.NumberFormat;
  date: Intl.DateTimeFormat;
  collator: Intl.Collator;
}

const cache = new Map<string | undefined, LocaleFormats>();

/** Cached per locale; `undefined` is the browser's. */
export function localeFormats(locale: string | undefined): LocaleFormats {
  let formats = cache.get(locale);
  if (!formats) {
    formats = {
      number: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
      date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
      collator: new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }),
    };
    cache.set(locale, formats);
  }
  return formats;
}

interface LocaleTable {
  options: { meta?: { locale?: string } };
}

// Formatting also serves tables not made by `useGrid`, which have no grid meta: they format in the browser's locale.
const localeOf = (table: LocaleTable) => table.options.meta?.locale;

/** Formats a number in the table's locale with at most two decimals. */
export function formatNumber(value: number, table: LocaleTable): string {
  return localeFormats(localeOf(table)).number.format(value);
}

/**
 * Formats a cell value as text through `meta.formatValue`, else numbers and dates in the table's locale; `null` and
 * `undefined` give an empty string.
 */
export function formatValue<TData extends RowData, TValue extends CellData>(
  value: unknown,
  column: GridColumn<TData, TValue>
): string {
  if (value === null || value === undefined) return '';
  const format = column.columnDef.meta?.formatValue;
  if (format) return format(value);
  const formats = localeFormats(localeOf(column.table));
  if (typeof value === 'number') return formats.number.format(value);
  if (value instanceof Date) return formats.date.format(value);
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  return JSON.stringify(value) ?? '';
}

/**
 * Formats an aggregate like `formatValue`, except counts: they are numbers whatever the column holds, so the column's
 * own formatter does not apply to them.
 */
export function formatAggregate<TData extends RowData, TValue extends CellData>(
  value: unknown,
  column: GridColumn<TData, TValue>
): string {
  const aggregation = column.columnDef.aggregationFn;
  if (aggregation === 'count' || aggregation === 'uniqueCount') {
    return typeof value === 'number' ? formatNumber(value, column.table) : '';
  }
  return formatValue(value, column);
}
