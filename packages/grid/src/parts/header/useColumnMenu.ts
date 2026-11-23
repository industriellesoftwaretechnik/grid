import type { RowData } from '@tanstack/react-table';

import type { GridMenuSection } from '#/core/shared/menu.ts';
import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { columnMenu, type ColumnMenuOptions } from '#/parts/header/columnMenu.ts';

/**
 * The header menu of a column, as data: sorting, filtering, pinning, grouping and aggregation, hiding, the columns
 * shown and "Reset columns". It stays current while rendered; empty for `meta.menu: false`.
 */
export function useColumnMenu<TData extends RowData>(
  column: GridColumn<TData>,
  options: ColumnMenuOptions
): GridMenuSection[] {
  return useGridSelector(column.table, () => columnMenu(column.table, column, options));
}
