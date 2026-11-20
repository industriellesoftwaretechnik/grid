import type { CellData, RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { isExpandable } from '#/logic/columns/columnGroups.ts';
import { resolveMeta, type ResolvedColumnMeta } from '#/logic/columns/columnMeta.ts';

export function columnMeta<TData extends RowData, TValue extends CellData>(
  column: GridColumn<TData, TValue>
): ResolvedColumnMeta {
  return resolveMeta(column.columnDef.meta);
}

export function columnLabel<TData extends RowData>(column: GridColumn<TData>): string {
  const { header, meta } = column.columnDef;
  return meta?.label ?? (typeof header === 'string' ? header : column.id);
}

/** Whether a column group has a collapse toggle, given the columns the user left visible. */
export function isExpandableGroup<TData extends RowData>(
  column: GridColumn<TData>,
  ownVisibility: Record<string, boolean>
): boolean {
  return isExpandable(
    column.columns.map((child) => ({
      show: child.columnDef.meta?.groupShow,
      visible: child.getLeafColumns().some((leaf) => ownVisibility[leaf.id] !== false),
    }))
  );
}

// TanStack gives every column ggregationFn: 'auto', display columns too, so only data columns count.
export function showsTotal<TData extends RowData>(column: GridColumn<TData>): boolean {
  return column.accessorFn !== undefined && column.columnDef.aggregationFn !== undefined;
}

export function hasAggregations<TData extends RowData>(columns: readonly GridColumn<TData>[]): boolean {
  return columns.some(showsTotal);
}
