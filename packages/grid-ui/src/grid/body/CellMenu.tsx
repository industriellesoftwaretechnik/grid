import type { RowData } from '@tanstack/react-table';

import { MenuEntries } from '#/grid/MenuEntries.tsx';
import { ContextMenuContent } from '#/internal/components/context-menu.tsx';
import { cellMenu, type CellMenuItems, type CoreTable } from '@istec/grid-core';

/** The context menu of the body; it acts on the range or the focused cell, which a right click focuses first. */
export function CellMenu<TData extends RowData>(props: { table: CoreTable<TData>; items?: CellMenuItems<TData> }) {
  return (
    <ContextMenuContent className="w-56">
      <CellMenuContent {...props} />
    </ContextMenuContent>
  );
}

// Rendered only while the menu is open, so the focused cell and the selection are read when it opens.
function CellMenuContent<TData extends RowData>({
  table,
  items,
}: {
  table: CoreTable<TData>;
  items?: CellMenuItems<TData>;
}) {
  'use no memo';
  return <MenuEntries sections={cellMenu(table, items)} />;
}
