import type { ReactNode } from 'react';

import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridColumn } from '#/core/types.ts';
import { columnMenu } from '#/grid/header/columnMenu.ts';
import { MenuEntries } from '#/grid/MenuEntries.tsx';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '#/internal/components/context-menu.tsx';

/** The header's context menu around its content; without one where the column sets `meta.menu: false`. */
export function ColumnMenu<TData extends object>({
  table,
  column,
  onFilter,
  className,
  children,
}: {
  table: GridInstance<TData>;
  column: GridColumn<TData>;
  onFilter: () => void;
  className?: string;
  children: ReactNode;
}) {
  if (column.columnDef.meta?.menu === false) return <div className={className}>{children}</div>;

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      <ContextMenuContent className="ig:w-52" onPointerDown={(event) => event.stopPropagation()}>
        <ColumnMenuContent table={table} column={column} onFilter={onFilter} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Rendered only while the menu is open.
function ColumnMenuContent<TData extends object>({
  table,
  column,
  onFilter,
}: {
  table: GridInstance<TData>;
  column: GridColumn<TData>;
  onFilter: () => void;
}) {
  // Kept current while the menu is open.
  const sections = useGridSelector(table, () => columnMenu(table, column, { onFilter }));
  return <MenuEntries sections={sections} />;
}
