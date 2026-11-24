import type { RowData } from '@tanstack/react-table';

import { canGroupBy, columnLabel } from '#/core/columns/columnInfo.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface ColumnReorderModel {
  /** The ids of the headers that can be dragged, in display order: the scrolling columns. */
  headerIds: string[];
  /** Whether dropping the column into the group panel would group by it. */
  canGroupBy: (columnId: string) => boolean;
  /** Groups by the column, as dropping it into the group panel does. */
  groupBy: (columnId: string) => void;
  /** The column's name, for a drag preview. */
  label: (columnId: string) => string;
}

/**
 * What a drag and drop of headers does: reorder the scrolling columns (`table.moveColumn`), or group by a column
 * dropped into the group panel. Pinned columns keep the order they were pinned in. The dragging itself is the UI's.
 */
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
