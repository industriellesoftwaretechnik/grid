import type { CSSProperties } from 'react';

import type { RowData, SortDirection } from '@tanstack/react-table';

import type { CoreTable, GridColumn, GridHeader } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { headerLayout, headerStickyStyle, type Region } from '#/parts/view/layout.ts';

export interface HeaderSlot<TData extends RowData> {
  header: GridHeader<TData>;
  region: Region;
  /** The pinned header next to the scrolling ones, which draws the border between them. */
  edge: boolean;
  /** Keeps a pinned header in place. */
  style: CSSProperties | undefined;
  /** Sorts by the column, with Ctrl adding it to a multi-sort; unset where it cannot be sorted. */
  toggleSorting: ((event: unknown) => void) | undefined;
  sorted: false | SortDirection;
  /** The column's place in a multi-sort, from 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
  filtered: boolean;
}

export interface HeaderRow<TData extends RowData> {
  id: string;
  /** The headers in display order; `'filler'` takes the spare width. */
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

/** The header rows, column groups above the columns, each in display order. */
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

/** The header rows, re-rendering when the columns, their order, sizes, sorting or filters change. */
export function useHeaderRows<TData extends RowData>(table: CoreTable<TData>): HeaderRow<TData>[] {
  return useGridSelector(table, () => headerRows(table));
}
