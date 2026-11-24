import type { GridColumnDef } from '#/core/table/types.ts';

/** The id of the group column, whose header the UI names. */
export const groupColumnId = 'auto-group';

/**
 * The column that holds the groups of every level when `groupDisplay` is `groupColumn`, and the toggles of master rows
 * while it is shown. `useBodyCell` gives a group row's cell the grouped column's cell to show. It has no header text:
 * `useHeaderCell` marks it with `groupColumn`.
 */
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
