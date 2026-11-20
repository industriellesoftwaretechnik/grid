import { constructTable, createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testFeatures } from '#/core/testFeatures.ts';
import type { GridFeatures } from '#/core/types.ts';
import { columnOrderIds, columnTree, moveColumns } from '#/logic/columns/columnOrder.ts';

type Item = { id: string; a: string; b: string; c: string; d: string };

const helper = createColumnHelper<GridFeatures, Item>();
const columns = helper.columns([
  helper.display({ id: 'select', meta: { lockPosition: true } }),
  helper.accessor('a', { header: 'A' }),
  helper.group({
    id: 'g',
    header: 'G',
    columns: helper.columns([helper.accessor('b', { header: 'B' }), helper.accessor('c', { header: 'C' })]),
  }),
  helper.accessor('d', { header: 'D' }),
]);

function table(columnOrder: string[] = []) {
  return constructTable({ features: testFeatures, columns, data: [], initialState: { columnOrder } });
}

const ids = (nodes: ReturnType<typeof columnTree<Item>>): unknown[] =>
  nodes.map((node) => (node.children.length > 0 ? { [node.column.id]: ids(node.children) } : node.column.id));

describe('moveColumns', () => {
  const order = ['select', 'a', 'b', 'c', 'd'];

  it('moves a column after the target when moving forward and before it when moving back', () => {
    expect(moveColumns(order, ['a'], ['c'])).toEqual(['select', 'b', 'c', 'a', 'd']);
    expect(moveColumns(order, ['d'], ['b'])).toEqual(['select', 'a', 'd', 'b', 'c']);
  });

  it('moves a group as one block', () => {
    expect(moveColumns(order, ['b', 'c'], ['d'])).toEqual(['select', 'a', 'd', 'b', 'c']);
    expect(moveColumns(order, ['d'], ['b', 'c'])).toEqual(['select', 'a', 'd', 'b', 'c']);
  });
});

describe('columnTree', () => {
  it('nests columns under their group and leaves out locked columns', () => {
    expect(ids(columnTree(table()))).toEqual(['a', { g: ['b', 'c'] }, 'd']);
  });

  it('follows the column order', () => {
    expect(ids(columnTree(table(['d', 'c', 'b'])))).toEqual(['d', { g: ['c', 'b'] }, 'a']);
  });

  it('completes a partial column order with the defined one', () => {
    expect(columnOrderIds(table(['d']))).toEqual(['d', 'select', 'a', 'b', 'c']);
  });
});
