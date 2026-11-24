import type { RowData } from '@tanstack/react-table';

import { selectionSummary } from '#/core/selection/cellSelection.ts';
import type { CoreTable } from '#/core/table/types.ts';

/** What a status bar tells, as numbers; `formatNumber` writes them in the grid's locale. */
export interface GridStatus {
  /** All data rows, and those the filters let through. */
  rows: number;
  shownRows: number;
  /** The top-level groups; 0 while the rows are not grouped. */
  groups: number;
  /** The selected data rows; group rows do not count. */
  selectedRows: number;
  /** For a range of more than one cell: the number of its cells, and the sum and mean of its numbers. */
  cells: { count: number; sum?: number; mean?: number } | undefined;
}

export function gridStatus<TData extends RowData>(table: CoreTable<TData>): GridStatus {
  const coreRows = table.getCoreRowModel();
  const selection = table.atoms.rowSelection.get();
  const { count, sum, average } = selectionSummary(table);
  return {
    rows: coreRows.flatRows.length,
    shownRows: table.getFilteredRowModel().flatRows.length,
    groups: table.atoms.grouping.get().length > 0 ? table.getGroupedRowModel().rows.length : 0,
    selectedRows: Object.keys(selection).filter((rowId) => selection[rowId] && coreRows.rowsById[rowId] !== undefined)
      .length,
    cells: count < 2 ? undefined : { count, sum, mean: average },
  };
}
