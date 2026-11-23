import type { RowData } from '@tanstack/react-table';

import { selectionSummary } from '#/core/selection/cellSelection.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable } from '#/core/table/types.ts';

const countFormat = new Intl.NumberFormat();
const valueFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

/** The number of rows, of those passing the filters, and of groups. */
export function rowCounts<TData extends RowData>(table: CoreTable<TData>): { rows: string; groups?: string } {
  const { t } = gridMeta(table);
  const total = table.getCoreRowModel().flatRows.length;
  const shown = table.getFilteredRowModel().flatRows.length;
  const groups = table.atoms.grouping.get().length > 0 ? table.getGroupedRowModel().rows.length : 0;
  return {
    rows:
      shown === total
        ? t('status.rows', { count: countFormat.format(total) })
        : t('status.filtered', { count: countFormat.format(shown), total: countFormat.format(total) }),
    groups: groups > 0 ? t('status.groups', { count: countFormat.format(groups) }) : undefined,
  };
}

/** The number of selected rows, unless none is. Selection also holds group rows, which do not count. */
export function selectedRows<TData extends RowData>(table: CoreTable<TData>): string | undefined {
  const rows = table.getCoreRowModel().rowsById;
  const selection = table.atoms.rowSelection.get();
  const count = Object.keys(selection).filter((rowId) => selection[rowId] && rows[rowId] !== undefined).length;
  return count > 0 ? gridMeta(table).t('status.selected', { count: countFormat.format(count) }) : undefined;
}

/** For a range of more than one cell: the number of its cells and the sum and average of its numbers. */
export function cellSummary<TData extends RowData>(
  table: CoreTable<TData>
): { cells: string; sum?: string; average?: string } | undefined {
  const { count, sum, average } = selectionSummary(table);
  if (count < 2) return undefined;
  return {
    cells: gridMeta(table).t('status.cells', { count: countFormat.format(count) }),
    sum: sum === undefined ? undefined : valueFormat.format(sum),
    average: average === undefined ? undefined : valueFormat.format(average),
  };
}
