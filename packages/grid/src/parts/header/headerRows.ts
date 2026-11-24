import type { CSSProperties } from 'react';

import type { RowData, SortDirection } from '@tanstack/react-table';

import type { CoreTable, GridColumn, GridHeader } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { headerLayout, headerStickyStyle, type Region } from '#/parts/view/layout.ts';

/** A header cell's place in its header row, with its sort and filter state; `useHeaderCell` takes it. */
export interface HeaderSlot<TData extends RowData> {
  header: GridHeader<TData>;
  region: Region;
  /** The pinned header next to the scrolling ones, which draws the border between them. */
  edge: boolean;
  /** Keeps a pinned header in place; unset for a scrolling one. */
  style: CSSProperties | undefined;
  /** Ctrl adds it to a multi-sort; unset where the column cannot be sorted. */
  toggleSorting: ((event: unknown) => void) | undefined;
  sorted: false | SortDirection;
  /** From 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
  filtered: boolean;
}

/** One header row: column groups above, columns in the last. */
export interface HeaderRow<TData extends RowData> {
  id: string;
  /** `'filler'` takes the spare width. */
  slots: (HeaderSlot<TData> | 'filler')[];
}

// One handler per column, so header rows built again compare equal while nothing changed.
const sortHandlers = new WeakMap<object, (event: unknown) => void>();

function sortHandler<TData extends RowData>(column: GridColumn<TData>) {
  let handler = sortHandlers.get(column);
  if (!handler) {
    handler = (event: unknown) => column.getToggleSortingHandler()?.(event);
    sortHandlers.set(column, handler);
  }
  return handler;
}

export function headerRows<TData extends RowData>(table: CoreTable<TData>): HeaderRow<TData>[] {
  const multiSort = table.atoms.sorting.get().length > 1;
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
        toggleSorting: header.column.getCanSort() ? sortHandler(header.column) : undefined,
        sorted: header.column.getIsSorted(),
        sortPosition: multiSort ? header.column.getSortIndex() + 1 : 0,
        filtered: header.column.getIsFiltered(),
      };
    }),
  }));
}

/** The header: its rows of header cells, pinned ones first and last, with a filler before the end-pinned ones. */
export function useHeaderRows<TData extends RowData>(table: CoreTable<TData>): HeaderRow<TData>[] {
  return useGridSelector(table, () => headerRows(table));
}
