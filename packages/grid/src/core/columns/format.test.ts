import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { formatAggregate, formatNumber, formatValue } from '#/core/columns/format.ts';
import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';

type Item = { amount: number; day: Date };
const helper = createColumnHelper<GridFeatures, Item>();

function setup(locale: string) {
  const table = testTable({
    columns: helper.columns([helper.accessor('amount', { aggregationFn: 'count' }), helper.accessor('day', {})]),
    data: [{ amount: 1, day: new Date(2026, 0, 31) }],
    meta: { locale },
  });
  const column = (id: string) => {
    const found = table.getColumn(id);
    if (!found) throw new Error(`no column ${id}`);
    return found;
  };
  return { table, column };
}

describe('formatting in the grid locale', () => {
  it('formats numbers and dates as the locale writes them', () => {
    const de = setup('de-DE');
    expect(formatValue(1234.567, de.column('amount'))).toBe('1.234,57');
    expect(formatValue(new Date(2026, 0, 31), de.column('day'))).toBe('31.01.2026');
    expect(formatNumber(1234.5, de.table)).toBe('1.234,5');

    const en = setup('en-US');
    expect(formatValue(1234.567, en.column('amount'))).toBe('1,234.57');
    expect(formatValue(new Date(2026, 0, 31), en.column('day'))).toBe('Jan 31, 2026');
  });

  it('formats counts as numbers', () => {
    const { column } = setup('de-DE');
    expect(formatAggregate(12345, column('amount'))).toBe('12.345');
  });
});
