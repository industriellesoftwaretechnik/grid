import { describe, expect, it } from 'vite-plus/test';

import { bodyEntries, isDetailEntry } from '#/logic/expanding/bodyEntries.ts';
import { stickyGroupRows } from '#/logic/grouping/stickyGroups.ts';

const row = (id: string, expanded: boolean, subRows: unknown[] = []) => ({
  id,
  depth: 0,
  subRows,
  getIsExpanded: () => expanded,
});

describe('bodyEntries', () => {
  const rows = [row('a', true), row('b', false), row('c', true, [{}])];

  it('adds a detail after each expanded row without children', () => {
    const entries = bodyEntries(rows, true);
    expect(entries.map((entry) => entry.id)).toEqual(['a', 'a:detail', 'b', 'c']);
    expect(entries.map((entry) => isDetailEntry(entry))).toEqual([false, true, false, false]);
  });

  it('keeps the rows when the table has no details', () => {
    expect(bodyEntries(rows, false)).toBe(rows);
  });

  it('pins a master row while its detail scrolls', () => {
    const entries = bodyEntries([row('a', true), row('b', false)], true);
    const ends = [10, 110, 120];
    const sticky = stickyGroupRows(
      entries,
      50,
      10,
      (offset) => ends.findIndex((end) => end > offset),
      (index) => ends[index] ?? 0
    );
    expect(sticky).toEqual([{ index: 0, top: 0 }]);
  });
});
