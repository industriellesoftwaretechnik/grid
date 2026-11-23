import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { cellSummary, rowCounts, selectedRows } from '#/parts/footer/statusBar.ts';
import { aggregationMark } from '#/parts/footer/totalsRow.ts';

/**
 * The footer: the number of rows, of those passing the filters and of groups, of selected rows with a button that
 * clears the selection, and for a range the number of its cells and the sum and average of its numbers.
 */
export function useStatusBar<TData extends RowData>(table: CoreTable<TData>) {
  const t = useTranslate(table);
  const status = useGridSelector(table, () => {
    const cells = cellSummary(table);
    return {
      ...rowCounts(table),
      selected: selectedRows(table),
      cells: cells && {
        count: cells.cells,
        sum: cells.sum === undefined ? undefined : { mark: aggregationMark(table, 'sum'), text: cells.sum },
        average:
          cells.average === undefined ? undefined : { mark: aggregationMark(table, 'mean'), text: cells.average },
      },
    };
  });

  return {
    ...status,
    clearSelection: {
      label: t('status.clear-selection'),
      onClick: () => table.resetRowSelection(true),
    },
  };
}

/** What `useStatusBar` gives the status bar. */
export type StatusBarModel = ReturnType<typeof useStatusBar>;
