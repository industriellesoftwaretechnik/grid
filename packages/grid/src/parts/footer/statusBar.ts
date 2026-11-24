import type { RowData } from '@tanstack/react-table';

import { selectionSummary } from '#/core/selection/cellSelection.ts';
import type { CoreTable } from '#/core/table/types.ts';

/** The counts a status bar shows; `formatNumber` writes them in the grid's locale. */
export interface GridStatus {
  /** All data rows, tree rows included; `shownRows` are those the filters let through. */
  rows: number;
  shownRows: number;
  /** Top-level groups; 0 while the rows are not grouped. */
  groups: number;
  /** Selected data rows, also those the filters hide; group rows do not count. */
  selectedRows: number;
  /** Set for more than one selected cell; `sum` and `mean` are over their numbers outside group rows, unset if none. */
  cells: { count: number; sum?: number; mean?: number } | undefined;
}

/** The table's status: row counts, selected rows and the selected cells. */
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
