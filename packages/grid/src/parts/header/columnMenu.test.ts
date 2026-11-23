import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import type { GridMenuEntry, GridMenuItem, GridMenuSection } from '#/core/shared/menu.ts';
import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { columnMenu } from '#/parts/header/columnMenu.ts';

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

const labels = (entries: GridMenuEntry[] = []) => entries.map((entry) => entry.label);
const section = (menu: GridMenuSection[], id: string) => menu.find((candidate) => candidate.id === id)?.entries;

function submenuItems(menu: GridMenuSection[], id: string): GridMenuItem[] {
  const entry = menu.flatMap((candidate) => candidate.entries).find((candidate) => candidate.id === id);
  if (entry?.type !== 'submenu') throw new Error(`no submenu ${id}`);
  return entry.sections.flatMap((candidate) => candidate.entries).filter((item) => item.type === 'item');
}

describe('columnMenu', () => {
  it('offers sorting, filtering, pinning, grouping, aggregation, hiding and resetting', () => {
    const { table, column } = setup();
    const menu = columnMenu(table, column, { onFilter: () => {} });

    expect(menu.map((candidate) => candidate.id)).toEqual(['sort', 'filter', 'layout', 'columns']);
    expect(labels(section(menu, 'sort'))).toEqual(['Sort ascending', 'Sort descending']);
    expect(labels(section(menu, 'layout'))).toEqual(['Pin', 'Group by this column', 'Aggregation']);
    expect(labels(section(menu, 'columns'))).toEqual(['Hide column', 'Reset columns']);
  });

  it('offers to clear what is set', () => {
    const { table, column } = setup();
    column.toggleSorting(true);
    column.setFilterValue([1, 2]);
    const menu = columnMenu(table, column, { onFilter: () => {} });

    const sort = section(menu, 'sort') ?? [];
    expect(labels(sort)).toEqual(['Sort ascending', 'Sort descending', 'Clear sort']);
    expect(sort.find((entry) => entry.id === 'sort.desc')).toMatchObject({ disabled: true });
    expect(labels(section(menu, 'filter'))).toEqual(['Filter', 'Clear filter']);
  });

  it('chooses an aggregation, or none', () => {
    const { table, column } = setup();
    const options = () => submenuItems(columnMenu(table, column, { onFilter: () => {} }), 'aggregation');

    expect(options().map((option) => option.id)).toEqual([
      'aggregation.none',
      'aggregation.sum',
      'aggregation.mean',
      'aggregation.median',
      'aggregation.min',
      'aggregation.max',
      'aggregation.count',
    ]);
    options()[1]?.onSelect();
    expect(table.atoms.columnAggregation.get()).toEqual({ amount: 'sum' });
    expect(options().find((option) => option.checked)?.id).toBe('aggregation.sum');
    options()[0]?.onSelect();
    expect(table.atoms.columnAggregation.get()).toEqual({ amount: null });
  });

  it('is empty for a column without menu', () => {
    const { table, column } = setup({ menu: false });
    expect(columnMenu(table, column, { onFilter: () => {} })).toEqual([]);
  });
});
