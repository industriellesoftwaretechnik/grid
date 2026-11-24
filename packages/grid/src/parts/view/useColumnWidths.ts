import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { columnLayout } from '#/parts/view/layout.ts';

/** A column's width in px; `'filler'` takes the spare width and has none. */
export type ColumnWidth = { id: string; width: number } | 'filler';

/** The widths of the visible columns in display order. */
export interface ColumnWidths {
  /** The sum of the column widths, in px. */
  width: number;
  columns: ColumnWidth[];
}

/** Widths for the `<colgroup>` of each fixed-layout table; the filler, having none, keeps spare width off the rest. */
export function useColumnWidths<TData extends RowData>(table: CoreTable<TData>): ColumnWidths {
  return useGridSelector(table, () => ({
    width: table.getTotalSize(),
    columns: columnLayout(table).map((slot) =>
      slot === 'filler' ? ('filler' as const) : { id: slot.item.id, width: slot.item.getSize() }
    ),
  }));
}
