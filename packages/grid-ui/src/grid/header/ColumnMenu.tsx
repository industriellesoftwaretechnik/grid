import type { ReactNode } from 'react';

import { MenuEntries } from '#/grid/MenuEntries.tsx';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '#/internal/components/context-menu.tsx';
import { useColumnMenu, type GridColumn, type GridInstance } from '@istec/grid-core';

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
      <ContextMenuContent className="w-52" onPointerDown={(event) => event.stopPropagation()}>
        <ColumnMenuContent table={table} column={column} onFilter={onFilter} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function ColumnMenuContent<TData extends object>({
  table,
  column,
  onFilter,
}: {
  table: GridInstance<TData>;
  column: GridColumn<TData>;
  onFilter: () => void;
}) {
  return <MenuEntries sections={useColumnMenu(table, column, { onFilter })} />;
}
