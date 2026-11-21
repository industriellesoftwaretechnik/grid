import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { groupColumn, groupColumnId } from '#/columns/groupColumn.tsx';
import { testTable } from '#/core/testTable.ts';
import type { GridFeatures } from '#/core/types.ts';
import { displayedRowIds, rowToggleColumnId } from '#/logic/focus/gridCells.ts';
import { moveFocus } from '#/logic/focus/navigation.ts';

type Person = { name: string; team: string };
const helper = createColumnHelper<GridFeatures, Person>();
const columns = helper.columns([helper.accessor('name', {}), helper.accessor('team', {})]);
const data: Person[] = [{ name: 'Ada', team: 'red' }];

describe('displayedRowIds', () => {
  it('reads and finds the rows in display order, pinned ones first', () => {
    const people = ['Ada', 'Bo', 'Cy'].map((name) => ({ name, team: 'red' }));
    const table = testTable({ columns, data: people, getRowId: (person) => person.name });
    table.setRowPinning({ top: ['Cy'], bottom: [] });
    const ids = displayedRowIds(table);

    expect(ids.length).toBe(3);
    expect([0, 1, 2, 3].map((index) => ids.at(index))).toEqual(['Cy', 'Ada', 'Bo', undefined]);
    expect(['Cy', 'Ada', 'Bo', 'Dee'].map((id) => ids.indexOf(id))).toEqual([0, 1, 2, -1]);
    expect(moveFocus(ids, ['name'], { rowId: 'Ada', columnId: 'name' }, 'down', 1)).toEqual({
      rowId: 'Bo',
      columnId: 'name',
    });
  });
});

describe('rowToggleColumnId', () => {
  it('is unset without tree data or details', () => {
    expect(rowToggleColumnId(testTable({ columns, data }))).toBeUndefined();
  });

  it('is the expand column while it is shown, otherwise the first shown data column', () => {
    const table = testTable({ columns, data, meta: { expandColumn: 'name' } });
    expect(rowToggleColumnId(table)).toBe('name');

    table.setColumnVisibility({ name: false });
    expect(rowToggleColumnId(table)).toBe('team');
  });

  it('is the group column while it is shown', () => {
    const table = testTable({
      columns: [groupColumn<Person>('Group'), ...columns],
      data,
      meta: { expandColumn: 'name', groupDisplay: 'groupColumn' },
    });
    expect(rowToggleColumnId(table)).toBe(groupColumnId);

    table.setColumnVisibility({ [groupColumnId]: false });
    expect(rowToggleColumnId(table)).toBe('name');
  });
});
