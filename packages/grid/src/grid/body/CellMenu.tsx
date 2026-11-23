import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/types.ts';
import { useCellMenu, type CellMenuItems } from '#/grid/body/cellMenu.ts';
import { MenuEntries } from '#/grid/MenuEntries.tsx';

/**
 * The context menu of the body; it acts on the range or the focused cell, which a right click focuses first. It is
 * rendered only while the menu is open.
 */
export function CellMenu<TData extends RowData>({
  table,
  items,
}: {
  table: CoreTable<TData>;
  items?: CellMenuItems<TData>;
}) {
  return <MenuEntries sections={useCellMenu(table, items)} />;
}
