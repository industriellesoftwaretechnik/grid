import type { ReactNode } from 'react';

import { X } from 'lucide-react';

import { barClassName, pinnedClassName, textAlign } from '@/components/data-grid/styles';
import { cn } from '@/lib/utils';
import { useStatusBar, useTotalsRow, type AggregationMark, type CoreTable } from '@istec/grid';

/** The mark of an aggregation, such as Σ, with its name as tooltip. */
export function AggregationMarkView({ mark, className }: { mark: AggregationMark | undefined; className?: string }) {
  if (!mark) return null;
  return (
    <abbr
      title={mark.name}
      aria-label={mark.name}
      className={cn('mr-1.5 font-normal text-muted-foreground no-underline', className)}
    >
      {mark.symbol}
    </abbr>
  );
}

/** The footer row with the totals of the aggregated columns. */
export function TotalsRow<TData extends object>({ table, rowHeight }: { table: CoreTable<TData>; rowHeight: number }) {
  const slots = useTotalsRow(table);

  return (
    <tr className="font-medium" style={{ height: rowHeight }}>
      {slots.map((slot) =>
        slot === 'filler' ? (
          <td key="filler" aria-hidden />
        ) : (
          <td
            key={slot.column.id}
            style={slot.style}
            className={cn(
              'truncate px-2 align-middle whitespace-nowrap',
              slot.total && textAlign[slot.align],
              pinnedClassName(slot.region, slot.edge)
            )}
          >
            {slot.total && (
              <>
                <AggregationMarkView mark={slot.total.mark} />
                {slot.total.text}
              </>
            )}
          </td>
        )
      )}
    </tr>
  );
}

/**
 * The footer with the number of rows, of those passing the filters, of groups and of selected rows, and for a range
 * the number of its cells and the sum and average of its numbers.
 */
export function StatusBar<TData extends object>({
  table,
  children,
}: {
  table: CoreTable<TData>;
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
              <AggregationMarkView mark={status.cells.sum.mark} className="mr-1" />
              {status.cells.sum.text}
            </span>
          )}
          {status.cells.average && (
            <span>
              <AggregationMarkView mark={status.cells.average.mark} className="mr-1" />
              {status.cells.average.text}
            </span>
          )}
        </span>
      )}
      {children !== undefined && <span className="ml-auto">{children}</span>}
    </div>
  );
}
