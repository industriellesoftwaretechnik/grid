import type { CSSProperties } from 'react';

import type { SortDirection } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridHeader } from '#/core/types.ts';
import { headerLayout, headerStickyStyle, type Region } from '#/logic/layout.ts';

export interface HeaderSlot<TData extends object> {
  header: GridHeader<TData>;
  region: Region;
  /** The pinned header next to the scrolling ones, which draws the border between them. */
  edge: boolean;
  /** Keeps a pinned header in place. */
  style: CSSProperties | undefined;
  sorted: false | SortDirection;
  /** The column's place in a multi-sort, from 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
  filtered: boolean;
  /** For a column group header: whether the group is collapsed. */
  collapsed: boolean;
}

/** The header rows, column groups above the columns, each in display order; `'filler'` takes the spare width. */
export function headerRows<TData extends object>(
  table: GridInstance<TData>
): { id: string; slots: (HeaderSlot<TData> | 'filler')[] }[] {
  const multiSort = table.state.sorting.length > 1;
  const { collapsedColumnGroups } = gridMeta(table).extraState;

  return headerLayout(table).map(({ id, slots }) => ({
    id,
    slots: slots.map((slot) => {
      if (slot === 'filler') return slot;
      const { item: header, region, edge } = slot;
      return {
        header,
        region,
        edge,
        style: headerStickyStyle(header, region),
        sorted: header.column.getIsSorted(),
        sortPosition: multiSort ? header.column.getSortIndex() + 1 : 0,
        filtered: header.column.getIsFiltered(),
        collapsed: collapsedColumnGroups[header.column.id] === true,
      };
    }),
  }));
}
