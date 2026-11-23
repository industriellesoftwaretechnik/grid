import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { setFilter } from '#/parts/filters/setFilter.ts';

type Item = { id: string; status: string | null };
const helper = createColumnHelper<GridFeatures, Item>();

function setup(statuses: (string | null)[]) {
  const table = testTable({
    columns: helper.columns([helper.accessor('status', { header: 'Status', filterFn: 'arrHas' })]),
    data: statuses.map((status, index) => ({ id: String(index), status })),
    getRowId: (item) => item.id,
  });
  const column = table.getColumn('status');
  if (!column) throw new Error('no column');
  return { table, column };
}

describe('setFilter', () => {
  it('lists the values with their counts, blanks first and the rest by label', () => {
    const { column } = setup(['b', 'a', null, 'b', '']);
    const { options } = setFilter(column, '');

    expect(options.map(({ label, count }) => [label, count])).toEqual([
      ['(Blank)', 2],
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('starts with every value checked', () => {
    const { column } = setup(['a', 'b']);
    const model = setFilter(column, '');

    expect(model.options.every(model.isChecked)).toBe(true);
    expect(model.selectAll).toEqual({ checked: true, indeterminate: false, disabled: false });
  });

  it('unchecking a value filters it out, and checking all again clears the filter', () => {
    const { table, column } = setup(['a', 'b']);
    const [a] = setFilter(column, '').options;
    if (!a) throw new Error('no option');

    setFilter(column, '').toggle([a], false);
    expect(column.getFilterValue()).toEqual(['b']);
    expect(table.getFilteredRowModel().rows.map((row) => row.original.status)).toEqual(['b']);
    expect(setFilter(column, '').selectAll).toMatchObject({ checked: false, indeterminate: true });

    setFilter(column, '').toggleAll(true);
    expect(column.getFilterValue()).toBeUndefined();
  });

  it('searches the labels, and Enter keeps only the values found', () => {
    const { column } = setup(['apple', 'banana', 'apricot']);
    const found = setFilter(column, 'AP');

    expect(found.options.map((option) => option.label)).toEqual(['apple', 'apricot']);
    found.keepFound();
    expect(column.getFilterValue()).toEqual(['apple', 'apricot']);
  });
});
