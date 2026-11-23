import { describe, expect, it } from 'vite-plus/test';

import { stickyGroupRows } from '#/logic/grouping/stickyGroups.ts';

const height = 10;
const tree = (depths: number[], expanded: number[]) =>
  depths.map((depth, index) => ({ depth, getIsExpanded: () => expanded.includes(index) }));
const sticky = (rows: ReturnType<typeof tree>, offset: number) =>
  stickyGroupRows(
    rows,
    offset,
    height,
    (at) => (at < rows.length * height ? Math.floor(at / height) : undefined),
    (index) => (index + 1) * height
  );

describe('stickyGroupRows', () => {
  // A > a1 a2 a3, B > b1 b2
  const flat = tree([0, 1, 1, 1, 0, 1, 1], [0, 4]);

  it('pins the group of the top row', () => {
    expect(sticky(flat, 25)).toEqual([{ index: 0, top: 0 }]);
  });

  it('pushes a group row up as its group scrolls out', () => {
    expect(sticky(flat, 35)).toEqual([{ index: 0, top: -5 }]);
  });

  it('pins nothing above an ungrouped row', () => {
    expect(sticky(tree([0, 0, 0], []), 15)).toEqual([]);
  });

  it('pins no expanded row that shows nothing below it', () => {
    expect(sticky(tree([0, 0, 0], [0, 1]), 5)).toEqual([]);
  });

  // A > (S > s1 s2), (T > t1 t2)
  const nested = tree([0, 1, 2, 2, 1, 2, 2], [0, 1, 4]);

  it('stacks nested groups', () => {
    expect(sticky(nested, 15)).toEqual([
      { index: 0, top: 0 },
      { index: 1, top: 10 },
    ]);
  });

  it('pushes a subgroup out under its parent', () => {
    expect(sticky(nested, 25)).toEqual([
      { index: 0, top: 0 },
      { index: 1, top: 5 },
    ]);
  });
});
