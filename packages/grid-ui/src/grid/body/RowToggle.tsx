import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { ChevronRight } from 'lucide-react';

import { useRowToggle, type GridRow } from '@istec/grid-core';

/** A cell's content behind the chevron that expands its row: a group, a tree node or a master row. */
export function RowToggle<TData extends RowData>({
  row,
  level,
  showCount = false,
  children,
}: {
  row: GridRow<TData>;
  /** The indentation, in levels. */
  level: number;
  /** Shows the number of records in the group. */
  showCount?: boolean;
  children: ReactNode;
}) {
  const toggle = useRowToggle(row);

  return (
    <span className="flex max-w-full items-center gap-1" style={{ paddingLeft: level * 16 }}>
      {toggle.canExpand ? (
        <button
          type="button"
          aria-expanded={toggle.expanded}
          aria-label={toggle.label}
          onClick={toggle.toggle}
          className="-m-0.5 shrink-0 cursor-pointer rounded-sm p-0.5 hover:bg-muted-foreground/20"
        >
          <ChevronRight className={cn('size-3.5 transition-transform', toggle.expanded && 'rotate-90')} />
        </button>
      ) : (
        <span aria-hidden className="size-3.5 shrink-0" />
      )}
      <span className="truncate">{children}</span>
      {showCount && <span className="text-muted-foreground tabular-nums">({toggle.count})</span>}
    </span>
  );
}
