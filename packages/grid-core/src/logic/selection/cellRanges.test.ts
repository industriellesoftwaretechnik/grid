import { describe, expect, it } from 'vite-plus/test';

import {
  anchorOf,
  extendLatestRange,
  fillBounds,
  freeCornerOf,
  repeatSource,
  singleBlock,
} from '#/logic/selection/cellRanges.ts';

const range = { anchorRowId: '1', anchorColumnId: 'a', focusRowId: '2', focusColumnId: 'b' };
const bounds = (minRowIndex: number, maxRowIndex: number, minColumnIndex: number, maxColumnIndex: number) => ({
  minRowIndex,
  maxRowIndex,
  minColumnIndex,
  maxColumnIndex,
});

describe('ranges', () => {
  it('focuses the anchor and extends the free corner of the latest range', () => {
    const ranges = [{ ...range, anchorRowId: '9' }, range];
    expect(anchorOf(ranges)).toEqual({ rowId: '1', columnId: 'a' });
    const extended = extendLatestRange(ranges, { rowId: '5', columnId: 'c' });
    expect(freeCornerOf(extended)).toEqual({ rowId: '5', columnId: 'c' });
    expect(anchorOf(extended)).toEqual({ rowId: '1', columnId: 'a' });
    expect(extended[0]).toBe(ranges[0]);
    expect(anchorOf([])).toBeNull();
  });

  it('finds the one block of more than one cell', () => {
    expect(singleBlock([bounds(0, 1, 0, 0)])).toEqual(bounds(0, 1, 0, 0));
    expect(singleBlock([bounds(0, 0, 0, 0)])).toBeUndefined();
    expect(singleBlock([bounds(0, 1, 0, 0), bounds(3, 3, 0, 0)])).toBeUndefined();
  });
});

describe('fill', () => {
  const source = bounds(2, 3, 1, 1);

  it('grows along the axis the handle moved further on', () => {
    expect(fillBounds(source, 6, 2)).toEqual(bounds(2, 6, 1, 1));
    expect(fillBounds(source, 0, 1)).toEqual(bounds(0, 3, 1, 1));
    expect(fillBounds(source, 3, 4)).toEqual(bounds(2, 3, 1, 4));
    expect(fillBounds(source, 2, 1)).toBe(source);
  });

  it('repeats the source block downwards and upwards', () => {
    const down = repeatSource(source, bounds(2, 6, 1, 1)).map((copy) => [copy.rowIndex, copy.sourceRowIndex]);
    expect(down).toEqual([
      [4, 2],
      [5, 3],
      [6, 2],
    ]);
    const up = repeatSource(source, bounds(0, 3, 1, 1)).map((copy) => [copy.rowIndex, copy.sourceRowIndex]);
    expect(up).toEqual([
      [0, 2],
      [1, 3],
    ]);
  });
});
