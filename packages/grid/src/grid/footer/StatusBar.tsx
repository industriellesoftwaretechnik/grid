import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { X } from 'lucide-react';

import type { CoreTable } from '#/core/types.ts';
import { useStatusBar } from '#/grid/footer/useStatusBar.ts';
import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';
import { barClassName } from '#/grid/styles.ts';

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
      className={cn(
        barClassName,
        'ig:min-h-6 ig:flex-wrap ig:gap-x-4 ig:gap-y-1 ig:border-t ig:text-muted-foreground ig:tabular-nums'
      )}
    >
      <span>{status.rows}</span>
      {status.groups && <span>{status.groups}</span>}
      {status.selected && (
        <span className="ig:flex ig:items-center ig:gap-1 ig:text-foreground">
          {status.selected}
          <button
            type="button"
            aria-label={status.clearSelection.label}
            title={status.clearSelection.label}
            onClick={status.clearSelection.onClick}
            className="ig:rounded-sm ig:p-0.5 ig:text-muted-foreground ig:hover:bg-muted-foreground/20 ig:hover:text-foreground"
          >
            <X className="ig:size-3" />
          </button>
        </span>
      )}
      {status.cells && (
        <span className="ig:flex ig:gap-3 ig:text-foreground">
          <span>{status.cells.count}</span>
          {status.cells.sum && (
            <span>
              <AggregationSymbol mark={status.cells.sum.mark} className="ig:mr-1" />
              {status.cells.sum.text}
            </span>
          )}
          {status.cells.average && (
            <span>
              <AggregationSymbol mark={status.cells.average.mark} className="ig:mr-1" />
              {status.cells.average.text}
            </span>
          )}
        </span>
      )}
      {children !== undefined && <span className="ig:ml-auto">{children}</span>}
    </div>
  );
}
