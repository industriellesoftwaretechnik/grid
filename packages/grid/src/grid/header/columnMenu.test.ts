import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/testTable.ts';
import type { GridFeatures } from '#/core/types.ts';
import { columnMenu } from '#/grid/header/columnMenu.ts';
import type { MenuEntry } from '#/grid/menu.ts';

type Item = { name: string; amount: number };
const helper = createColumnHelper<GridFeatures, Item>();

function setup(meta: Parameters<typeof helper.accessor>[1]['meta'] = { dataType: 'number' }) {
  const table = testTable({
    columns: helper.columns([
      helper.accessor('name', { header: 'Name' }),
      helper.accessor('amount', { header: 'Amount', meta }),
    ]),
    data: [{ name: 'a', amount: 1 }],
  });
  const column = table.getColumn('amount');
  if (!column) throw new Error('no column');
  return { table, column };
}

const labels = (entries: MenuEntry[]) => entries.map((entry) => entry.label);

describe('columnMenu', () => {
  it('offers sorting, filtering, pinning, grouping and hiding', () => {
    const { table, column } = setup();
    const menu = columnMenu(table, column, { onFilter: () => {} });

    expect(menu.map((section) => section.id)).toEqual(['sort', 'filter', 'pin', 'group', 'hide']);
    expect(labels(menu[0]?.entries ?? [])).toEqual(['Sort ascending', 'Sort descending']);
    expect(labels(menu[3]?.entries ?? [])).toEqual(['Group by this column', 'Aggregation']);
  });

  it('offers to clear what is set', () => {
    const { table, column } = setup();
    column.toggleSorting(true);
    column.setFilterValue([1, 2]);
    const menu = columnMenu(table, column, { onFilter: () => {} });

    const sort = menu[0]?.entries ?? [];
    expect(labels(sort)).toEqual(['Sort ascending', 'Sort descending', 'Clear sort']);
    expect(sort.find((entry) => entry.id === 'sort.desc')).toMatchObject({ disabled: true });
    expect(labels(menu[1]?.entries ?? [])).toEqual(['Filter', 'Clear filter']);
  });

  it('chooses an aggregation, or none', () => {
    const { table, column } = setup();
    const aggregation = columnMenu(table, column, { onFilter: () => {} })[3]?.entries[1];
    if (aggregation?.type !== 'choice') throw new Error('no aggregation choice');

    expect(aggregation.options.map((option) => option.value)).toEqual([
      'none',
      'sum',
      'mean',
      'median',
      'min',
      'max',
      'count',
    ]);
    aggregation.onChange('sum');
    expect(table.atoms.columnAggregation.get()).toEqual({ amount: 'sum' });
    aggregation.onChange('none');
    expect(table.atoms.columnAggregation.get()).toEqual({ amount: null });
  });

  it('is empty for a column without menu', () => {
    const { table, column } = setup({ menu: false });
    expect(columnMenu(table, column, { onFilter: () => {} })).toEqual([]);
  });
});
