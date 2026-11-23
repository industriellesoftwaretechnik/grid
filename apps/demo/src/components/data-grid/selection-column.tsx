import { RowCheckbox, SelectAllCheckbox } from '@/components/data-grid/selection-checkboxes';
import type { GridColumnDef } from '@istec/grid';

/** The checkbox column; pin it with `columnPinning: { start: ['select'] }`. */
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
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <RowCheckbox row={row} />,
  };
}
