import type { CellData, RowData } from '@tanstack/react-table';

import { resolveMeta, type FilterKind, type ResolvedColumnMeta } from '#/core/columns/columnMeta.ts';
import type { GridColumn } from '#/core/table/types.ts';

/** Returns the column's `meta` with the data type's defaults filled in. */
export function columnMeta<TData extends RowData, TValue extends CellData>(
  column: GridColumn<TData, TValue>
): ResolvedColumnMeta {
  return resolveMeta(column.columnDef.meta);
}

export function filterKindOf<TData extends RowData>(column: GridColumn<TData>): FilterKind | undefined {
  const { filter } = columnMeta(column);
  return filter !== false && column.getCanFilter() ? filter : undefined;
}

/** Returns the column's name: `meta.label`, else a string header, else the column id. */
export function columnLabel<TData extends RowData>(column: GridColumn<TData>): string {
  const { header, meta } = column.columnDef;
  return meta?.label ?? (typeof header === 'string' ? header : column.id);
}

// TanStack gives every column `aggregationFn: 'auto'`, display columns too, so only data columns count.
export function showsTotal<TData extends RowData>(column: GridColumn<TData>): boolean {
  return column.accessorFn !== undefined && column.columnDef.aggregationFn !== undefined;
}

export function canGroupBy<TData extends RowData>(column: GridColumn<TData>): boolean {
  return column.getCanGroup() && !column.getIsGrouped();
}

export function hasAggregations<TData extends RowData>(columns: readonly GridColumn<TData>[]): boolean {
  return columns.some(showsTotal);
}
