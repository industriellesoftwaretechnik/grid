import { constructTable, createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testFeatures } from '#/core/testFeatures.ts';
import { setAtPath, type CellValueChange } from '#/plugins/cellEditingFeature.ts';

type Item = { id: string; name: string; price: number; tags: { label: string } };

const helper = createColumnHelper<typeof testFeatures, Item>();
const columns = helper.columns([
  helper.accessor('name', { enableEditing: true }),
  helper.accessor('price', {
    enableEditing: (row) => row.original.id !== 'locked',
    validateCellValue: (value) => (value < 0 ? 'negative' : undefined),
  }),
  helper.accessor('tags.label', { id: 'label', enableEditing: true }),
  helper.accessor((item) => item.name.length, { id: 'length', enableEditing: true }),
]);

function setup(data: Item[]) {
  const changes: CellValueChange<typeof testFeatures, Item>[] = [];
  const onCellValueChange = (change: CellValueChange<typeof testFeatures, Item>) => {
    changes.push(change);
  };
  const table = constructTable({
    features: testFeatures,
    columns,
    data,
    getRowId: (item) => item.id,
    onCellValueChange,
  });
  const cell = (rowId: string, columnId: string) => {
    const found = table
      .getRow(rowId)
      .getAllCells()
      .find((candidate) => candidate.column.id === columnId);
    if (!found) throw new Error(`no cell ${rowId}/${columnId}`);
    return found;
  };
  return { table, cell, changes };
}

const items: Item[] = [
  { id: '1', name: 'Pen', price: 2, tags: { label: 'office' } },
  { id: 'locked', name: 'Ink', price: 5, tags: { label: 'office' } },
];

describe('cellEditingFeature', () => {
  it('edits only columns and rows that opt in and can be written', () => {
    const { cell } = setup(items);
    expect(cell('1', 'name').getCanEdit()).toBe(true);
    expect(cell('1', 'price').getCanEdit()).toBe(true);
    expect(cell('locked', 'price').getCanEdit()).toBe(false);
    expect(cell('1', 'length').getCanEdit()).toBe(false);
  });

  it('reports the edited row and keeps the data untouched', () => {
    const { cell, changes } = setup(items);
    expect(cell('1', 'label').setValue('home')).toBeUndefined();
    expect(changes[0]).toMatchObject({ columnId: 'label', value: 'home', previousValue: 'office' });
    expect(changes[0]?.updatedRow).toEqual({ ...items[0], tags: { label: 'home' } });
    expect(items[0]?.tags.label).toBe('office');
  });

  it('returns the validation message instead of reporting', () => {
    const { cell, changes } = setup(items);
    expect(cell('1', 'price').setValue(-1)).toBe('negative');
    expect(changes).toHaveLength(0);
  });

  it('tracks the editing cell', () => {
    const { table, cell } = setup(items);
    cell('1', 'name').startEditing();
    expect(table.getEditingCell()).toEqual({ rowId: '1', columnId: 'name' });
    expect(cell('1', 'name').getIsEditing()).toBe(true);
    cell('1', 'length').startEditing();
    expect(table.getEditingCell()).toEqual({ rowId: '1', columnId: 'name' });
    table.stopEditing();
    expect(table.getEditingCell()).toBeNull();
  });

  it('undoes and redoes edits through the change callback', () => {
    const { table, cell, changes } = setup(items);
    cell('1', 'name').setValue('Pencil');
    expect(table.undoCellEdit()).toBe(true);
    expect(changes[1]).toMatchObject({ value: 'Pen', previousValue: 'Pencil' });
    expect(table.redoCellEdit()).toBe(true);
    expect(changes[2]).toMatchObject({ value: 'Pencil' });
    expect(table.redoCellEdit()).toBe(false);
  });

  it('builds each change of a row on the one before and undoes them together', () => {
    const { table, changes } = setup(items);
    const rejected = table.setCellValues([
      { rowId: '1', columnId: 'name', value: 'Pencil' },
      { rowId: '1', columnId: 'label', value: 'school' },
      { rowId: '1', columnId: 'price', value: -3 },
      { rowId: 'locked', columnId: 'price', value: 9 },
    ]);
    expect(rejected).toEqual([{ rowId: '1', columnId: 'price', message: 'negative' }]);
    expect(changes.at(-1)?.updatedRow).toEqual({ ...items[0], name: 'Pencil', tags: { label: 'school' } });
    table.undoCellEdit();
    expect(changes.slice(2).map((change) => change.value)).toEqual(['office', 'Pen']);
  });
});

describe('setAtPath', () => {
  it('copies the objects along a dotted path', () => {
    const source = { a: { b: 1, c: 2 }, d: 3 };
    expect(setAtPath(source, 'a.b', 9)).toEqual({ a: { b: 9, c: 2 }, d: 3 });
    expect(source.a.b).toBe(1);
  });
});
