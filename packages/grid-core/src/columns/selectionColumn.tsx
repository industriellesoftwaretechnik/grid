import { gridMeta } from '#/core/gridMeta.ts';
import type { GridColumnDef } from '#/core/types.ts';

/** The checkbox column; its checkboxes come from the UI layer's `SelectAllCheckbox` and `RowCheckbox`. */
export function selectionColumn<TData extends object>(): GridColumnDef<TData> {
  return {
    id: 'select',
    size: 36,
    minSize: 36,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    enableGrouping: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { lockPosition: true, menu: false, align: 'center' },
    header: ({ table }) => {
      const { SelectAllCheckbox } = gridMeta(table).components;
      return <SelectAllCheckbox table={table} />;
    },
    cell: ({ row }) => {
      const { RowCheckbox } = gridMeta(row.table).components;
      return <RowCheckbox row={row} />;
    },
  };
}
