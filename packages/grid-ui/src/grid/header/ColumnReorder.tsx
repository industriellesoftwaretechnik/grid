import type { ReactNode } from 'react';

import { cn } from 'cn';
import { ArrowLeftRight, Ban, Group } from 'lucide-react';

import { columnLabel, ColumnReorder as HeadlessColumnReorder, type GridInstance } from '@istec/grid-core';

/** Reorders the header's columns by drag and drop; the dragged column's icon tells what a drop does. */
export function ColumnReorder<TData extends object>({
  table,
  children,
}: {
  table: GridInstance<TData>;
  children: ReactNode;
}) {
  return (
    <HeadlessColumnReorder
      table={table}
      renderOverlay={(column, action) => (
        <div
          className={cn(
            'flex w-fit items-center gap-1.5 rounded-md border bg-popover px-2 py-1 text-xs font-medium shadow-md [&_svg]:size-3.5',
            action === 'reject' && 'border-destructive/50'
          )}
        >
          {action === 'move' && <ArrowLeftRight className="text-muted-foreground" />}
          {action === 'group' && <Group className="text-primary" />}
          {action === 'reject' && <Ban className="text-destructive" />}
          {columnLabel(column)}
        </div>
      )}
    >
      {children}
    </HeadlessColumnReorder>
  );
}
