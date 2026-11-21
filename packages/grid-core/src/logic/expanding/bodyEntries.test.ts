import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/testTable.ts';
import type { GridColumnDef, GridRow } from '#/core/types.ts';
import { bodyEntries, createBodyEntriesCache, isDetailEntry } from '#/logic/expanding/bodyEntries.ts';
import { stickyGroupRows } from '#/logic/grouping/stickyGroups.ts';

type Item = { id: string; name: string };
const itemColumns: GridColumnDef<Item>[] = [{ accessorKey: 'name', header: 'Name' }];
const items: Item[] = [
  { id: 'a', name: 'a' },
  { id: 'b', name: 'b' },
  { id: 'c', name: 'c' },
];

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

  it('builds the entries again only when the rows or the expanded state change', () => {
    const table = testTable<Item>({ columns: itemColumns, data: items, getRowId: (item) => item.id });
    const cached = createBodyEntriesCache<GridRow<Item>>();
    const ids = () => cached(table.getCenterRows(), table.atoms.expanded.get()).map((entry) => entry.id);

    const first = cached(table.getCenterRows(), table.atoms.expanded.get());
    expect(cached(table.getCenterRows(), table.atoms.expanded.get())).toBe(first);

    table.setExpanded({ b: true });
    expect(ids()).toEqual(['a', 'b', 'b:detail', 'c']);

    table.setSorting([{ id: 'name', desc: true }]);
    expect(ids()).toEqual(['c', 'b', 'b:detail', 'a']);

    table.setExpanded({});
    expect(ids()).toEqual(['c', 'b', 'a']);

    table.setExpanded(true);
    expect(ids()).toEqual(['c', 'c:detail', 'b', 'b:detail', 'a', 'a:detail']);
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
