import type { RowData } from '@tanstack/react-table';

import type { GridExtraState } from '#/core/gridMeta.ts';
import type { GridColumnDef } from '#/core/types.ts';
import { isExpandable } from '#/logic/columns/columnGroups.ts';
import { resolveMeta } from '#/logic/columns/columnMeta.ts';
import { filterFnByKind } from '#/logic/filters/filterFns.ts';

type Def<TData extends RowData> = GridColumnDef<TData>;

function childColumns<TData extends RowData>(def: Def<TData>): readonly Def<TData>[] | undefined {
  return 'columns' in def ? def.columns : undefined;
}

function columnDefId<TData extends RowData>(def: Def<TData>): string | undefined {
  if (def.id) return def.id;
  if ('accessorKey' in def) return String(def.accessorKey).replaceAll('.', '_');
  return typeof def.header === 'string' ? def.header : undefined;
}

function readValue<TData extends RowData>(def: Def<TData>, row: TData): unknown {
  if ('accessorFn' in def) return def.accessorFn(row, 0);
  if (!('accessorKey' in def)) return undefined;
  let value: unknown = row;
  for (const key of String(def.accessorKey).split('.')) {
    value = typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
  }
  return value;
}

/**
 * Completes each data column's meta and applies its filter and the aggregation chosen in the menu. Without
 * `columnAggregation`, as for server rows, no column aggregates.
 */
export function resolveColumns<TData extends RowData>(
  columns: readonly Def<TData>[],
  firstRow: TData | undefined,
  columnAggregation: GridExtraState['columnAggregation'] | undefined
): Def<TData>[] {
  const resolve = (def: Def<TData>): Def<TData> => {
    const children = childColumns(def);
    if (children) return { ...def, columns: children.map(resolve) };
    if (!('accessorKey' in def) && !('accessorFn' in def)) return def;

    const id = columnDefId(def);
    const meta = resolveMeta(def.meta, firstRow === undefined ? undefined : readValue(def, firstRow));
    const base = {
      ...def,
      filterFn: def.filterFn ?? (meta.filter === false ? undefined : filterFnByKind[meta.filter]),
      enableColumnFilter: def.enableColumnFilter ?? meta.filter !== false,
    };
    if (!columnAggregation) return { ...base, meta: { ...meta, aggregations: [] }, aggregationFn: undefined };
    const chosen = id === undefined ? undefined : columnAggregation[id];
    return { ...base, meta, aggregationFn: chosen === undefined ? def.aggregationFn : (chosen ?? undefined) };
  };
  return columns.map(resolve);
}

function leafIds<TData extends RowData>(def: Def<TData>): string[] {
  const children = childColumns(def);
  if (children) return children.flatMap(leafIds);
  const id = columnDefId(def);
  return id === undefined ? [] : [id];
}

/** The columns that open and collapsed groups hide; a group that `isExpandable` rejects hides none. */
export function hiddenByColumnGroups<TData extends RowData>(
  columns: readonly Def<TData>[],
  collapsed: GridExtraState['collapsedColumnGroups'],
  ownVisibility: Record<string, boolean> = {}
): Record<string, false> {
  const hidden: Record<string, false> = {};
  const visit = (def: Def<TData>) => {
    const children = childColumns(def);
    if (!children) return;
    children.forEach(visit);
    const expandable = isExpandable(
      children.map((child) => ({
        show: child.meta?.groupShow,
        visible: leafIds(child).some((id) => ownVisibility[id] !== false),
      }))
    );
    if (!expandable) return;
    const groupId = columnDefId(def);
    const isCollapsed = groupId !== undefined && collapsed[groupId] === true;
    for (const child of children) {
      const show = child.meta?.groupShow;
      if (show && (show === 'open') === isCollapsed) for (const id of leafIds(child)) hidden[id] = false;
    }
  };
  columns.forEach(visit);
  return hidden;
}

/** The id of the first column with a value, in definition order. */
export function firstDataColumnId<TData extends RowData>(columns: readonly Def<TData>[]): string | undefined {
  for (const def of columns) {
    const children = childColumns(def);
    const id = children
      ? firstDataColumnId(children)
      : 'accessorKey' in def || 'accessorFn' in def
        ? columnDefId(def)
        : undefined;
    if (id !== undefined) return id;
  }
  return undefined;
}

export function insertAfterLockedColumns<TData extends RowData>(columns: Def<TData>[], column: Def<TData>) {
  const index = columns.findIndex((def) => !def.meta?.lockPosition);
  return columns.toSpliced(index === -1 ? columns.length : index, 0, column);
}
