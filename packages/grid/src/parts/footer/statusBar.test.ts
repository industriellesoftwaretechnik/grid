import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { gridStatus } from '#/parts/footer/statusBar.ts';

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

describe('gridStatus', () => {
  it('counts the rows, and those passing the filters', () => {
    const table = setup();
    expect(gridStatus(table)).toEqual({ rows: 3, shownRows: 3, groups: 0, selectedRows: 0, cells: undefined });

    table.getColumn('team')?.setFilterValue('red');
    expect(gridStatus(table)).toMatchObject({ rows: 3, shownRows: 2 });
  });

  it('counts the groups', () => {
    const table = setup();
    table.setGrouping(['team']);
    expect(gridStatus(table).groups).toBe(2);
  });

  it('counts selected data rows, not group rows', () => {
    const table = setup();
    table.setGrouping(['team']);
    table.toggleAllRowsSelected(true);
    expect(gridStatus(table).selectedRows).toBe(3);
  });

  it('sums and averages the numbers of a range of more than one cell', () => {
    const table = setup();
    table.setFocusedCell('1', 'points');
    expect(gridStatus(table).cells).toBeUndefined();

    table.setCellSelection([{ anchorRowId: '1', anchorColumnId: 'team', focusRowId: '3', focusColumnId: 'points' }]);
    expect(gridStatus(table).cells).toEqual({ count: 6, sum: 12, mean: 4 });
  });
});
