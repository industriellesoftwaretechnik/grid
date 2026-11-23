import type { CellData, RowData } from '@tanstack/react-table';

import { resolveMeta, type FilterKind, type ResolvedColumnMeta } from '#/core/columns/columnMeta.ts';
import type { GridColumn } from '#/core/table/types.ts';

export function columnMeta<TData extends RowData, TValue extends CellData>(
  column: GridColumn<TData, TValue>
): ResolvedColumnMeta {
  return resolveMeta(column.columnDef.meta);
}

/** The kind of the column's filter editor; unset where the column cannot be filtered. */
export function filterKindOf<TData extends RowData>(column: GridColumn<TData>): FilterKind | undefined {
  const { filter } = columnMeta(column);
  return filter !== false && column.getCanFilter() ? filter : undefined;
}

export function columnLabel<TData extends RowData>(column: GridColumn<TData>): string {
  const { header, meta } = column.columnDef;
  return meta?.label ?? (typeof header === 'string' ? header : column.id);
}

// TanStack gives every column `aggregationFn: 'auto'`, display columns too, so only data columns count.
export function showsTotal<TData extends RowData>(column: GridColumn<TData>): boolean {
  return column.accessorFn !== undefined && column.columnDef.aggregationFn !== undefined;
}

/** Whether dropping the column into the group panel groups by it; `enableGrouping: false` turns that off. */
export function canGroupBy<TData extends RowData>(column: GridColumn<TData>): boolean {
  return column.getCanGroup() && !column.getIsGrouped();
}

export function hasAggregations<TData extends RowData>(columns: readonly GridColumn<TData>[]): boolean {
  return columns.some(showsTotal);
}
