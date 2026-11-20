import { constructFilterFn, type RowData } from '@tanstack/react-table';

import type { GridFeatures, GridRow } from '#/core/types.ts';
import { formatValue } from '#/logic/format.ts';

const caches = new WeakMap<object, { query: string; matches: WeakMap<object, boolean> }>();

function matchesRow(row: GridRow<RowData>, words: string[]): boolean {
  const texts = row.table
    .getAllLeafColumns()
    .filter((column) => column.getCanGlobalFilter())
    .map((column) => formatValue(row.getValue(column.id), column).toLowerCase());
  return words.every((word) => texts.some((text) => text.includes(word)));
}

// TanStack calls a global filter once per column and keeps the row if any call passes, so each call judges the
// whole row and caches the answer per table.
export const quickFilter = constructFilterFn<GridFeatures, RowData>({
  resolveFilterValue: (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : ''),
  filter: (_value, query: string, row) => {
    let cache = caches.get(row.table);
    if (cache?.query !== query) {
      cache = { query, matches: new WeakMap() };
      caches.set(row.table, cache);
    }
    let match = cache.matches.get(row);
    if (match === undefined) {
      match = matchesRow(row, query.split(/\s+/));
      cache.matches.set(row, match);
    }
    return match;
  },
});
