import { constructTable, createColumnHelper, type RowSelectionState } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { rowSelectionState, withoutGroupRows } from '#/core/selection/rowSelectionState.ts';
import { testFeatures } from '#/core/table/testFeatures.ts';
import type { GridFeatures } from '#/core/table/types.ts';

type Item = { id: string; group: string; kind: string; children?: Item[] };

const helper = createColumnHelper<GridFeatures, Item>();
const columns = helper.columns([
  helper.accessor('group', { header: 'Group' }),
  helper.accessor('kind', { header: 'Kind' }),
]);
const data: Item[] = [
  { id: '1', group: 'a', kind: 'x' },
  { id: '2', group: 'a', kind: 'y' },
  { id: '3', group: 'b', kind: 'x' },
];

function groupedTable(grouping: string[]) {
  const table = constructTable({
    features: testFeatures,
    columns,
    data,
    getRowId: (item) => item.id,
    initialState: { grouping },
  });
  const topGroup = () => {
    const row = table.getRowModel().rows.find((candidate) => candidate.getIsGrouped());
    if (!row) throw new Error('no group row');
    return row;
  };
  return { table, topGroup };
}

describe('rowSelectionState', () => {
  it('derives a group row from its records', () => {
    const { table, topGroup } = groupedTable(['group']);

    expect(rowSelectionState(topGroup())).toEqual({ checked: false, indeterminate: false });
    table.setRowSelection({ '1': true });
    expect(rowSelectionState(topGroup())).toEqual({ checked: false, indeterminate: true });
    table.setRowSelection({ '1': true, '2': true });
    expect(rowSelectionState(topGroup())).toEqual({ checked: true, indeterminate: false });
  });

  it('is fully checked after its own checkbox selects it', () => {
    const { topGroup } = groupedTable(['group', 'kind']);

    topGroup().getToggleSelectedHandler()({ target: { checked: true } });
    expect(rowSelectionState(topGroup())).toEqual({ checked: true, indeterminate: false });
  });

  it('treats a tree node as a record of its own', () => {
    const tree: Item[] = [{ id: 'p', group: 'a', kind: 'x', children: [{ id: 'c', group: 'a', kind: 'y' }] }];
    const table = constructTable({
      features: testFeatures,
      columns,
      data: tree,
      getRowId: (item) => item.id,
      getSubRows: (item) => item.children,
    });
    const parent = table.getRow('p');

    table.setRowSelection({ c: true });
    expect(rowSelectionState(parent)).toEqual({ checked: false, indeterminate: true });
    parent.toggleSelected(true);
    expect(table.atoms.rowSelection.get()).toEqual({ p: true, c: true });
    expect(rowSelectionState(parent)).toEqual({ checked: true, indeterminate: false });
  });

  it('counts the records of nested groups, not their group rows', () => {
    const { table, topGroup } = groupedTable(['group', 'kind']);

    table.setRowSelection({ '1': true, '2': true });
    expect(rowSelectionState(topGroup())).toEqual({ checked: true, indeterminate: false });
  });
});

describe('withoutGroupRows', () => {
  it('drops the ids of group rows and keeps those of records', () => {
    const { table, topGroup } = groupedTable(['group', 'kind']);
    const group = topGroup();
    const nested = group.subRows[0];
    if (!nested) throw new Error('no nested group');

    const selection: RowSelectionState = { [group.id]: true, [nested.id]: true, '1': true, '2': true };
    expect(withoutGroupRows(table, selection)).toEqual({ '1': true, '2': true });
  });

  it('returns the selection itself when it holds no group rows', () => {
    const { table } = groupedTable([]);
    const selection: RowSelectionState = { '1': true };
    expect(withoutGroupRows(table, selection)).toBe(selection);
  });
});
