import { gridMeta } from '#/core/gridMeta.ts';
import type { GridColumnDef } from '#/core/types.ts';

export const groupColumnId = 'auto-group';

/**
 * The column that holds the groups of every level when `groupDisplay` is `groupColumn`, and the toggles of master rows
 * while it is shown. `useBodyCell` gives a group row's cell the grouped column's cell to show.
 */
export function groupColumn<TData extends object>(label: string): GridColumnDef<TData> {
  return {
    id: groupColumnId,
    size: 200,
    enableSorting: false,
    enableHiding: false,
    enableGrouping: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { label },
    header: ({ table }) => gridMeta(table).t('group'),
    cell: () => null,
  };
}
