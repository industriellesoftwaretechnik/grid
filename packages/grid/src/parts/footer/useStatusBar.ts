import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { gridStatus, type GridStatus } from '#/parts/footer/statusBar.ts';

/** The status bar: `gridStatus`, kept current; `table.resetRowSelection(true)` clears the selection it counts. */
export function useStatusBar<TData extends RowData>(table: CoreTable<TData>): GridStatus {
  return useGridSelector(table, () => gridStatus(table));
}
