import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import type { GridFeatures } from '#/core/types.ts';
import {
  firstDataColumnId,
  hiddenByColumnGroups,
  insertAfterLockedColumns,
  resolveColumns,
} from '#/logic/columns/columnDefs.ts';

type Order = { id: string; customer: string; total: number; placed: Date; status: string };

const helper = createColumnHelper<GridFeatures, Order>();
const columns = helper.columns([
  helper.accessor('customer', { header: 'Customer' }),
  helper.group({
    id: 'details',
    header: 'Details',
    columns: helper.columns([
      helper.accessor('total', { header: 'Total', aggregationFn: 'sum' }),
      helper.accessor('placed', { header: 'Placed', meta: { groupShow: 'open' } }),
      helper.accessor('status', { header: 'Status', meta: { dataType: 'enum', groupShow: 'closed' } }),
    ]),
  }),
]);
const firstRow: Order = { id: '1', customer: 'Ada', total: 12.5, placed: new Date(2024, 0, 1), status: 'open' };

function leaf(resolved: ReturnType<typeof resolveColumns<Order>>, path: number[]) {
  let def = resolved[path[0] ?? 0];
  for (const index of path.slice(1)) def = def && 'columns' in def ? def.columns?.[index] : undefined;
  return def;
}

describe('resolveColumns', () => {
  it('infers the data type and derives alignment, filter and aggregations from it', () => {
    const resolved = resolveColumns(columns, firstRow, {});

    expect(leaf(resolved, [0])).toMatchObject({
      meta: { dataType: 'text', align: 'start', filter: 'text', aggregations: ['count', 'uniqueCount'] },
      filterFn: 'includesString',
    });
    expect(leaf(resolved, [1, 0])).toMatchObject({
      meta: { dataType: 'number', align: 'end', filter: 'number' },
      filterFn: 'inNumberRange',
    });
    expect(leaf(resolved, [1, 1])).toMatchObject({ meta: { dataType: 'date' }, filterFn: 'inDateRange' });
    expect(leaf(resolved, [1, 2])).toMatchObject({ meta: { dataType: 'enum', filter: 'set' }, filterFn: 'arrHas' });
  });

  it('lets the chosen aggregation override or remove the defined one', () => {
    expect(leaf(resolveColumns(columns, firstRow, { total: 'mean' }), [1, 0])?.aggregationFn).toBe('mean');
    expect(leaf(resolveColumns(columns, firstRow, { total: null }), [1, 0])?.aggregationFn).toBeUndefined();
    expect(leaf(resolveColumns(columns, firstRow, {}), [1, 0])?.aggregationFn).toBe('sum');
  });

  it('turns aggregation off without a chosen-aggregation state', () => {
    expect(leaf(resolveColumns(columns, firstRow, undefined), [1, 0])).toMatchObject({
      aggregationFn: undefined,
      meta: { aggregations: [] },
    });
  });
});

describe('hiddenByColumnGroups', () => {
  it('hides closed-only columns while open and open-only columns while collapsed', () => {
    expect(hiddenByColumnGroups(columns, {})).toEqual({ status: false });
    expect(hiddenByColumnGroups(columns, { details: true })).toEqual({ placed: false });
  });

  it('hides nothing while the visible columns leave nothing to collapse, as AG Grid does', () => {
    expect(hiddenByColumnGroups(columns, { details: true }, { total: false, status: false })).toEqual({});
    expect(hiddenByColumnGroups(columns, {}, { total: false, placed: false })).toEqual({});
    expect(hiddenByColumnGroups(columns, { details: true }, { total: false })).toEqual({ placed: false });
  });
});

describe('firstDataColumnId', () => {
  it('skips display columns and descends into groups', () => {
    const display = helper.display({ id: 'select' });
    expect(firstDataColumnId([display, ...columns])).toBe('customer');
    expect(firstDataColumnId([display, ...columns.slice(1)])).toBe('total');
    expect(firstDataColumnId([display])).toBeUndefined();
  });
});

const ids = (defs: { id?: string }[]) => defs.map((def) => def.id ?? '?');

describe('insertAfterLockedColumns', () => {
  const locked = helper.display({ id: 'locked', meta: { lockPosition: true } });
  const added = helper.display({ id: 'added' });

  it('inserts after the leading locked columns', () => {
    expect(ids(insertAfterLockedColumns([locked, helper.display({ id: 'a' })], added))).toEqual([
      'locked',
      'added',
      'a',
    ]);
  });

  it('appends when every column is locked', () => {
    expect(ids(insertAfterLockedColumns([locked], added))).toEqual(['locked', 'added']);
  });
});
