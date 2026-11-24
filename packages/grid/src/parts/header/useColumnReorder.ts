import type { RowData } from '@tanstack/react-table';

import { canGroupBy, columnLabel } from '#/core/columns/columnInfo.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** What `useColumnReorder` returns. */
export interface ColumnReorderModel {
  /** The headers that can be dragged: scrolling columns without `meta.lockPosition`. */
  headerIds: string[];
  /** Whether the column can be grouped and is not grouped yet. */
  canGroupBy: (columnId: string) => boolean;
  /** Adds a group level, as dropping the column into the group panel does; a no-op where `canGroupBy` is false. */
  groupBy: (columnId: string) => void;
  /** The column's label for the drag preview; the id for an unknown column. */
  label: (columnId: string) => string;
}

/** Column drag and drop: the dragging itself is the UI's; pinned columns keep the order they were pinned in. */
export function useColumnReorder<TData extends RowData>(table: CoreTable<TData>): ColumnReorderModel {
  const headerIds = useGridSelector(table, () =>
    (table.getCenterHeaderGroups().at(-1)?.headers ?? [])
      .filter((header) => header.column.columnDef.meta?.lockPosition !== true)
      .map((header) => header.id)
  );

  return {
    headerIds,
    canGroupBy: (columnId) => {
      const column = table.getColumn(columnId);
      return column !== undefined && canGroupBy(column);
    },
    groupBy: (columnId) => {
      const column = table.getColumn(columnId);
      if (column && canGroupBy(column)) column.toggleGroupBy();
    },
    label: (columnId) => {
      const column = table.getColumn(columnId);
      return column ? columnLabel(column) : columnId;
    },
  };
}
