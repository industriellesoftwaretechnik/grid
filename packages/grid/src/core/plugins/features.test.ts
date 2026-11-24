import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';

type Item = { id: string; team: string; city: string; points: number };
const helper = createColumnHelper<GridFeatures, Item>();
const data: Item[] = [
  { id: '1', team: 'red', city: 'Bonn', points: 2 },
  { id: '2', team: 'red', city: 'Köln', points: 4 },
  { id: '3', team: 'blue', city: 'Bonn', points: 6 },
];

function setup() {
  return testTable({
    columns: helper.columns([
      helper.accessor('team', {}),
      helper.accessor('city', {}),
      helper.accessor('points', { meta: { dataType: 'number' } }),
    ]),
    data,
    getRowId: (item) => item.id,
  });
}

describe('filters', () => {
  it('counts the column filters and the search, and clears them all', () => {
    const table = setup();
    expect(table.getActiveFilterCount()).toBe(0);

    table.getColumn('team')?.setFilterValue('red');
    table.setGlobalFilter('Bonn');
    expect(table.getActiveFilterCount()).toBe(2);

    table.clearFilters();
    expect(table.getActiveFilterCount()).toBe(0);
    expect(table.getFilteredRowModel().rows).toHaveLength(3);
  });
});

describe('expanding parent rows', () => {
  it('is possible only while the rows are grouped', () => {
    const table = setup();
    expect(table.getCanExpandParentRows()).toBe(false);

    table.setGrouping(['team']);
    expect(table.getCanExpandParentRows()).toBe(true);
  });

  it('opens every group of every level, and closes them again', () => {
    const table = setup();
    table.setGrouping(['team', 'city']);

    table.expandParentRows();
    // 2 teams, 3 team-and-city groups, 3 rows.
    expect(table.getRowModel().rows).toHaveLength(8);

    table.toggleAllRowsExpanded(false);
    expect(table.getRowModel().rows).toHaveLength(2);
  });

  it('keeps open row details open', () => {
    const table = setup();
    table.setGrouping(['team']);
    table.setExpanded({ '1': true });

    table.expandParentRows();
    expect(table.atoms.expanded.get()).toMatchObject({ '1': true });
  });
});

describe('moving', () => {
  it('moves a grouping level, ignoring moves out of range', () => {
    const table = setup();
    table.setGrouping(['team', 'city']);

    table.moveGrouping(0, 1);
    expect(table.atoms.grouping.get()).toEqual(['city', 'team']);

    table.moveGrouping(0, 5);
    expect(table.atoms.grouping.get()).toEqual(['city', 'team']);
  });

  it('moves a column after the target when moving forward, before it when moving back', () => {
    const table = setup();

    table.moveColumn('team', 'city');
    expect(table.atoms.columnOrder.get()).toEqual(['city', 'team', 'points']);

    table.moveColumn('points', 'city');
    expect(table.atoms.columnOrder.get()).toEqual(['points', 'city', 'team']);
  });
});

describe('column aggregation', () => {
  it('offers the aggregations of the data type and tells the chosen one', () => {
    const table = setup();
    const points = table.getColumn('points');

    expect(points?.getAggregationOptions()).toEqual(['sum', 'mean', 'median', 'min', 'max', 'count']);
    expect(points?.getAggregation()).toBeUndefined();

    points?.setAggregation('mean');
    expect(points?.getAggregation()).toBe('mean');

    points?.setAggregation(null);
    expect(points?.getAggregation()).toBeUndefined();
  });
});
