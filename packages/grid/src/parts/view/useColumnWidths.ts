import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { columnLayout } from '#/parts/view/layout.ts';

/** The width of one `<col>`; `'filler'` takes the spare width and has none. */
export type ColumnWidth = { id: string; width: number } | 'filler';

export interface ColumnWidths {
  /** The table's width: the sum of the visible columns. */
  width: number;
  /** One per `<col>` of a `<colgroup>`, in display order. */
  columns: ColumnWidth[];
}

/**
 * The widths of the visible columns, for the `<colgroup>` of a fixed-layout `<table>`. Header, body and footer are
 * separate tables that share them. A fixed-layout table spreads spare width over all columns unless one has no width,
 * so the filler `<col>` gets none.
 */
export function useColumnWidths<TData extends RowData>(table: CoreTable<TData>): ColumnWidths {
  return useGridSelector(table, () => ({
    width: table.getTotalSize(),
    columns: columnLayout(table).map((slot) =>
      slot === 'filler' ? ('filler' as const) : { id: slot.item.id, width: slot.item.getSize() }
    ),
  }));
}
