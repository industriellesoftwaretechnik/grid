import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { X } from 'lucide-react';

import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';
import { barClassName } from '#/grid/styles.ts';
import { useStatusBar, type CoreTable } from '@istec/grid-core';

/**
 * The footer with the number of rows, of those passing the filters, of groups and of selected rows, and for a range
 * the number of its cells and the sum and average of its numbers.
 */
export function StatusBar<TData extends RowData>({
  table,
  children,
}: {
  table: CoreTable<TData>;
  /** Shown at the end of the bar, such as a hint or a sum. */
  children?: ReactNode;
}) {
  const status = useStatusBar(table);

  return (
    <div
      aria-live="polite"
      className={cn(barClassName, 'min-h-6 flex-wrap gap-x-4 gap-y-1 border-t text-muted-foreground tabular-nums')}
    >
      <span>{status.rows}</span>
      {status.groups && <span>{status.groups}</span>}
      {status.selected && (
        <span className="flex items-center gap-1 text-foreground">
          {status.selected}
          <button
            type="button"
            aria-label={status.clearSelection.label}
            title={status.clearSelection.label}
            onClick={status.clearSelection.onClick}
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      )}
      {status.cells && (
        <span className="flex gap-3 text-foreground">
          <span>{status.cells.count}</span>
          {status.cells.sum && (
            <span>
              <AggregationSymbol mark={status.cells.sum.mark} className="mr-1" />
              {status.cells.sum.text}
            </span>
          )}
          {status.cells.average && (
            <span>
              <AggregationSymbol mark={status.cells.average.mark} className="mr-1" />
              {status.cells.average.text}
            </span>
          )}
        </span>
      )}
      {children !== undefined && <span className="ml-auto">{children}</span>}
    </div>
  );
}
