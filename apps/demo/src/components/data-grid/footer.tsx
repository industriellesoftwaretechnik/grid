import type { ReactNode } from 'react';

import { X } from 'lucide-react';

import { aggregationName, aggregationSymbols, messages, statusTexts } from '@/components/data-grid/messages';
import { barClassName, pinnedClassName, textAlign } from '@/components/data-grid/styles';
import { cn } from '@/lib/utils';
import { useFormatNumber, useStatusBar, useTotalsRow, type AggregationName, type CoreTable } from '@istec/grid';

export function AggregationMark({
  aggregation,
  className,
}: {
  aggregation: AggregationName | undefined;
  className?: string;
}) {
  if (!aggregation) return null;
  const name = aggregationName(aggregation);
  return (
    <abbr
      title={name}
      aria-label={name}
      className={cn('mr-1.5 font-normal text-muted-foreground no-underline', className)}
    >
      {aggregationSymbols[aggregation]}
    </abbr>
  );
}

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
                <AggregationMark aggregation={slot.total.aggregation} />
                {slot.total.text}
              </>
            )}
          </td>
        )
      )}
    </tr>
  );
}

export function StatusBar<TData extends object>({
  table,
  children,
}: {
  table: CoreTable<TData>;
  children?: ReactNode;
}) {
  const status = useStatusBar(table);
  const format = useFormatNumber(table);
  const texts = statusTexts(status, format);
  const { cells } = status;

  return (
    <div
      aria-live="polite"
      className={cn(barClassName, 'min-h-6 flex-wrap gap-x-4 gap-y-1 border-t text-muted-foreground tabular-nums')}
    >
      <span>{texts.rows}</span>
      {texts.groups && <span>{texts.groups}</span>}
      {texts.selected && (
        <span className="flex items-center gap-1 text-foreground">
          {texts.selected}
          <button
            type="button"
            aria-label={messages.clearSelection}
            title={messages.clearSelection}
            onClick={() => table.resetRowSelection(true)}
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      )}
      {cells && (
        <span className="flex gap-3 text-foreground">
          <span>{texts.cells}</span>
          {cells.sum !== undefined && (
            <span>
              <AggregationMark aggregation="sum" className="mr-1" />
              {format(cells.sum)}
            </span>
          )}
          {cells.mean !== undefined && (
            <span>
              <AggregationMark aggregation="mean" className="mr-1" />
              {format(cells.mean)}
            </span>
          )}
        </span>
      )}
      {children !== undefined && <span className="ml-auto">{children}</span>}
    </div>
  );
}
