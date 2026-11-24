import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it, vi } from 'vite-plus/test';

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

const ids = (entries: GridMenuEntry[] = []) => entries.map((entry) => entry.id);
const section = (menu: GridMenuSection[], id: string) => menu.find((candidate) => candidate.id === id)?.entries;

const allEntries = (menu: GridMenuSection[]): GridMenuEntry[] =>
  menu
    .flatMap((candidate) => candidate.entries)
    .flatMap((entry): GridMenuEntry[] =>
      entry.type === 'submenu' ? [entry as GridMenuEntry].concat(allEntries(entry.sections)) : [entry]
    );

function item(menu: GridMenuSection[], id: string): GridMenuItem {
  const found = allEntries(menu).find((candidate) => candidate.id === id);
  if (found?.type !== 'item') throw new Error(`no item ${id}`);
  return found;
}

function submenuItems(menu: GridMenuSection[], id: string): GridMenuItem[] {
  const entry = menu.flatMap((candidate) => candidate.entries).find((candidate) => candidate.id === id);
  if (entry?.type !== 'submenu') throw new Error(`no submenu ${id}`);
  return entry.sections.flatMap((candidate) => candidate.entries).filter((candidate) => candidate.type === 'item');
}

describe('columnMenu', () => {
  it('offers sorting, filtering, pinning, grouping, aggregation, hiding and resetting, named by id', () => {
    const { table, column } = setup();
    const menu = columnMenu(table, column, { onFilter: () => {} });

    expect(menu.map((candidate) => candidate.id)).toEqual(['sort', 'filter', 'layout', 'columns']);
    expect(ids(section(menu, 'sort'))).toEqual(['sort.asc', 'sort.desc']);
    expect(ids(section(menu, 'layout'))).toEqual(['pin', 'group.by', 'aggregation']);
    expect(ids(section(menu, 'columns'))).toEqual(['column.hide', 'columns.reset']);
    expect(allEntries(menu).every((entry) => entry.label === undefined && entry.icon === undefined)).toBe(true);
  });

  it('acts on the column', () => {
    const { table, column } = setup();
    const menu = () => columnMenu(table, column, {});

    item(menu(), 'sort.desc').onSelect();
    expect(column.getIsSorted()).toBe('desc');
    item(menu(), 'pin.end').onSelect();
    expect(column.getIsPinned()).toBe('end');
    expect(item(menu(), 'pin.end').checked).toBe(true);
    item(menu(), 'group.by').onSelect();
    expect(table.atoms.grouping.get()).toEqual(['amount']);
    expect(ids(section(menu(), 'layout'))).toContain('group.remove');
  });

  it('offers to clear what is set', () => {
    const { table, column } = setup();
    column.toggleSorting(true);
    column.setFilterValue([1, 2]);
    const onFilter = vi.fn<() => void>();
    const menu = columnMenu(table, column, { onFilter });

    const sort = section(menu, 'sort') ?? [];
    expect(ids(sort)).toEqual(['sort.asc', 'sort.desc', 'sort.clear']);
    expect(sort.find((entry) => entry.id === 'sort.desc')).toMatchObject({ disabled: true });
    expect(ids(section(menu, 'filter'))).toEqual(['filter', 'filter.clear']);
    item(menu, 'filter').onSelect();
    expect(onFilter).toHaveBeenCalled();
  });

  it('offers to open the filter only where the UI can', () => {
    const { table, column } = setup();
    column.setFilterValue([1, 2]);
    expect(ids(section(columnMenu(table, column, {}), 'filter'))).toEqual(['filter.clear']);
    column.setFilterValue(undefined);
    expect(section(columnMenu(table, column, {}), 'filter')).toBeUndefined();
  });

  it('chooses an aggregation, or none', () => {
    const { table, column } = setup();
    const options = () => submenuItems(columnMenu(table, column, {}), 'aggregation');

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
    expect(columnMenu(table, column, {})).toEqual([]);
  });
});
