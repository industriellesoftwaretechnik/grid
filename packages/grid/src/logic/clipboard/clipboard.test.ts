import { constructTable, createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testFeatures } from '#/core/testFeatures.ts';
import type { GridFeatures } from '#/core/types.ts';
import { clearCells, copyText, pasteText } from '#/logic/clipboard/clipboard.ts';
import { resolveColumns } from '#/logic/columns/columnDefs.ts';
import { fillValues, selectionSummary } from '#/logic/selection/cellSelection.ts';

type Item = { id: string; name: string; price: number };

const helper = createColumnHelper<GridFeatures, Item>();
const data: Item[] = [
  { id: '1', name: 'Pen', price: 2 },
  { id: '2', name: 'Ink', price: 5 },
  { id: '3', name: 'Pad', price: 3 },
];
const columns = resolveColumns(
  helper.columns([helper.accessor('name', { enableEditing: true }), helper.accessor('price', { enableEditing: true })]),
  data[0],
  {}
);

function setup() {
  const changes: { row: { id: string }; columnId: string; value: unknown }[] = [];
  const table = constructTable({
    features: testFeatures,
    columns,
    data,
    getRowId: (item) => item.id,
    onCellValueChange: (change) => {
      changes.push(change);
    },
  });
  const selectRange = (anchorRowId: string, anchorColumnId: string, focusRowId: string, focusColumnId: string) =>
    table.selectCellRange({ anchorRowId, anchorColumnId, focusRowId, focusColumnId });
  const written = () => changes.map(({ row, columnId, value }) => [row.id, columnId, value]);
  return { table, selectRange, written };
}

describe('copyText', () => {
  it('copies the focused cell, the selected rows, or the range', () => {
    const { table, selectRange } = setup();
    table.setFocusedCell('2', 'price');
    expect(copyText(table)).toBe('5');
    table.setRowSelection({ '1': true, '3': true });
    expect(copyText(table, true)).toBe('name\tprice\r\nPen\t2\r\nPad\t3');
    selectRange('2', 'price', '1', 'name');
    expect(copyText(table)).toBe('Pen\t2\r\nInk\t5');
  });
});

describe('pasteText', () => {
  it('pastes a block from the focused cell and parses each column', () => {
    const { table, written } = setup();
    table.setFocusedCell('2', 'name');
    const rejected = pasteText(table, 'Quill\t7,5\r\nPaper\tabc\r\nignored\t1\r\n');
    expect(rejected).toEqual([]);
    expect(written()).toEqual([
      ['2', 'name', 'Quill'],
      ['2', 'price', 7.5],
      ['3', 'name', 'Paper'],
    ]);
  });

  it('fills one value into every selected row', () => {
    const { table, written } = setup();
    table.setRowSelection({ '1': true, '3': true });
    table.setFocusedCell('1', 'price');
    pasteText(table, '9');
    expect(written()).toEqual([
      ['1', 'price', 9],
      ['3', 'price', 9],
    ]);
  });

  it('repeats a block over a range it fits, else pastes it from the range start', () => {
    const { table, selectRange, written } = setup();
    selectRange('1', 'price', '3', 'price');
    pasteText(table, '7\r\n8');
    expect(written()).toEqual([
      ['1', 'price', 7],
      ['2', 'price', 8],
      ['3', 'price', 7],
    ]);
    selectRange('3', 'name', '2', 'name');
    pasteText(table, 'A\t4\tC');
    expect(written().slice(3)).toEqual([
      ['2', 'name', 'A'],
      ['2', 'price', 4],
    ]);
  });
});

describe('range edits', () => {
  it('clears a range as one undoable edit', () => {
    const { table, selectRange, written } = setup();
    selectRange('1', 'name', '2', 'name');
    clearCells(table);
    expect(written()).toEqual([
      ['1', 'name', ''],
      ['2', 'name', ''],
    ]);
    table.undoCellEdit();
    expect(written().slice(2)).toEqual([
      ['2', 'name', 'Ink'],
      ['1', 'name', 'Pen'],
    ]);
  });

  it('fills the cells a fill handle covers from the source block', () => {
    const { table } = setup();
    const source = { minRowIndex: 0, maxRowIndex: 0, minColumnIndex: 0, maxColumnIndex: 1 };
    expect(fillValues(table, source, { ...source, maxRowIndex: 2 })).toEqual([
      { rowId: '2', columnId: 'name', value: 'Pen' },
      { rowId: '2', columnId: 'price', value: 2 },
      { rowId: '3', columnId: 'name', value: 'Pen' },
      { rowId: '3', columnId: 'price', value: 2 },
    ]);
  });

  it('sums the numbers of a range', () => {
    const { table, selectRange } = setup();
    table.setFocusedCell('1', 'price');
    expect(selectionSummary(table)).toEqual({ count: 1 });
    selectRange('1', 'name', '3', 'price');
    expect(selectionSummary(table)).toEqual({ count: 6, sum: 10, average: 10 / 3 });
  });
});
