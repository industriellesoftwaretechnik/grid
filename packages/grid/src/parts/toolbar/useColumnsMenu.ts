import type { RowData } from '@tanstack/react-table';

import { columnLabel } from '#/core/columns/columnInfo.ts';
import { columnOrderIds } from '#/core/columns/columnOrder.ts';
import { menuItem, type GridMenuItem, type GridMenuSection } from '#/core/shared/menu.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export function columnChoices<TData extends RowData>(table: CoreTable<TData>): GridMenuItem[] {
  return columnOrderIds(table).flatMap((id): GridMenuItem[] => {
    const column = table.getColumn(id);
    if (!column?.getCanHide()) return [];
    return [
      {
        type: 'item',
        id: `column.${id}`,
        label: columnLabel(column),
        checked: column.getIsVisible(),
        keepOpen: true,
        onSelect: () => column.toggleVisibility(),
      },
    ];
  });
}

/**
 * The toolbar's columns menu: a visibility item per column that can be hidden, and a layout reset. It stays current
 * while rendered, so render it only while the menu is open.
 */
export function useColumnsMenu<TData extends RowData>(table: CoreTable<TData>): GridMenuSection[] {
  return useGridSelector(table, (): GridMenuSection[] => [
    { id: 'columns', entries: columnChoices(table) },
    { id: 'reset', entries: [menuItem('columns.reset', () => table.resetLayout())] },
  ]);
}
