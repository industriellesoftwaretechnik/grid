import type { RowData } from '@tanstack/react-table';

import { columnLabel } from '#/core/columns/columnInfo.ts';
import { columnOrderIds } from '#/core/columns/columnOrder.ts';
import { menuItem, type GridMenuEntry, type GridMenuSection } from '#/core/shared/menu.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** The columns the user can show and hide, in display order, each checked while shown. */
export function columnChoices<TData extends RowData>(table: CoreTable<TData>): GridMenuEntry[] {
  return columnOrderIds(table).flatMap((id) => {
    const column = table.getColumn(id);
    if (!column?.getCanHide()) return [];
    return [
      menuItem(`column.${id}`, columnLabel(column), undefined, () => column.toggleVisibility(), {
        checked: column.getIsVisible(),
        keepOpen: true,
      }),
    ];
  });
}

/**
 * The columns menu, as data: each column the user can hide as a check item that keeps the menu open, then "Reset
 * columns". It stays current while rendered, so render it only while the menu is open; its trigger's label is
 * `t('columns')`.
 */
export function useColumnsMenu<TData extends RowData>(table: CoreTable<TData>): GridMenuSection[] {
  return useGridSelector(table, (): GridMenuSection[] => [
    { id: 'columns', entries: columnChoices(table) },
    {
      id: 'reset',
      entries: [menuItem('columns.reset', gridMeta(table).t('columns.reset'), 'reset', () => table.resetLayout())],
    },
  ]);
}
