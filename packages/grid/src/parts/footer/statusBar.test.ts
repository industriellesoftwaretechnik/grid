import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { cellSummary, rowCounts, selectedRows } from '#/parts/footer/statusBar.ts';

type Item = { id: string; team: string; points: number };
const helper = createColumnHelper<GridFeatures, Item>();
const data: Item[] = [
  { id: '1', team: 'red', points: 2 },
  { id: '2', team: 'red', points: 4 },
  { id: '3', team: 'blue', points: 6 },
];

function setup() {
  return testTable({
    columns: helper.columns([helper.accessor('team', {}), helper.accessor('points', {})]),
    data,
    getRowId: (item) => item.id,
  });
}

describe('rowCounts', () => {
  it('counts the rows, and those passing the filters', () => {
    const table = setup();
    expect(rowCounts(table)).toEqual({ rows: '3 rows', groups: undefined });

    table.getColumn('team')?.setFilterValue('red');
    expect(rowCounts(table).rows).toBe('2 of 3 rows');
  });

  it('counts the groups', () => {
    const table = setup();
    table.setGrouping(['team']);
    expect(rowCounts(table).groups).toBe('2 groups');
  });
});

describe('selectedRows', () => {
  it('counts selected data rows, not group rows', () => {
    const table = setup();
    expect(selectedRows(table)).toBeUndefined();

    table.setGrouping(['team']);
    table.toggleAllRowsSelected(true);
    expect(selectedRows(table)).toBe('3 selected');
  });
});

describe('cellSummary', () => {
  it('sums and averages the numbers of a range of more than one cell', () => {
    const table = setup();
    table.setFocusedCell('1', 'points');
    expect(cellSummary(table)).toBeUndefined();

    table.setCellSelection([{ anchorRowId: '1', anchorColumnId: 'team', focusRowId: '3', focusColumnId: 'points' }]);
    expect(cellSummary(table)).toEqual({ cells: '6 cells', sum: '12', average: '4' });
  });
});
