import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { gridStatus, type GridStatus } from '#/parts/footer/statusBar.ts';

/**
 * The footer's numbers: the rows, those passing the filters, the groups and the selected rows, and for a range the
 * number of its cells with the sum and mean of its numbers. `table.resetRowSelection(true)` clears the selection.
 */
export function useStatusBar<TData extends RowData>(table: CoreTable<TData>): GridStatus {
  return useGridSelector(table, () => gridStatus(table));
}
