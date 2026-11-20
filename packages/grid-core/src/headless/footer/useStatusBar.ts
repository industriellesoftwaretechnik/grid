import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable } from '#/core/types.ts';
import { cellSummary, rowCounts, selectedRows } from '#/headless/footer/statusBar.ts';
import { aggregationMark } from '#/headless/footer/totalsRow.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/**
 * The footer: the number of rows, of those passing the filters and of groups, of selected rows with a button that
 * clears the selection, and for a range the number of its cells and the sum and average of its numbers. The counts
 * need a component that re-renders with the table's rows, such as one given the `GridInstance`.
 */
export function useStatusBar<TData extends RowData>(table: CoreTable<TData>) {
  'use no memo';
  const selected = useGridSelector(table.atoms.rowSelection, () => selectedRows(table));
  const cells = useGridSelector(table.atoms.cellSelection, () => cellSummary(table));

  return {
    ...rowCounts(table),
    selected,
    clearSelection: {
      label: gridMeta(table).t('status.clear-selection'),
      onClick: () => table.resetRowSelection(true),
    },
    cells: cells && {
      count: cells.cells,
      sum: cells.sum === undefined ? undefined : { mark: aggregationMark(table, 'sum'), text: cells.sum },
      average: cells.average === undefined ? undefined : { mark: aggregationMark(table, 'mean'), text: cells.average },
    },
  };
}
