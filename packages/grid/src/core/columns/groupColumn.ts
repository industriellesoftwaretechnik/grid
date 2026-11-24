import type { GridColumnDef } from '#/core/table/types.ts';

/** The id of the group column `groupDisplay: 'groupColumn'` adds; the UI names its header. */
export const groupColumnId = 'auto-group';

// Renders nothing itself: `useBodyCell` shows the grouped column's cell in it, and the UI names its header.
export function groupColumn<TData extends object>(): GridColumnDef<TData> {
  return {
    id: groupColumnId,
    size: 200,
    enableSorting: false,
    enableHiding: false,
    enableGrouping: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    header: () => null,
    cell: () => null,
  };
}
