import type { RowData } from '@tanstack/react-table';

import type { CoreTable, GridColumn } from '#/core/types.ts';
import { columnMenu, type ColumnMenuOptions } from '#/headless/header/columnMenu.ts';
import type { MenuSection } from '#/headless/menu.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/** The header's context menu, kept current while it is open. Empty for a column with `meta.menu: false`. */
export function useColumnMenu<TData extends RowData>(
  table: CoreTable<TData>,
  column: GridColumn<TData>,
  options: ColumnMenuOptions
): MenuSection[] {
  return useGridSelector(table, () => columnMenu(table, column, options));
}
