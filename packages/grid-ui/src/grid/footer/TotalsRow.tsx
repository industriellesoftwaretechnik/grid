import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';
import { pinnedClassName, textAlign } from '#/grid/styles.ts';
import { totalsRow, type CoreTable } from '@istec/grid-core';

/** The footer row with the totals of the aggregated columns. */
export function TotalsRow<TData extends RowData>({ table, rowHeight }: { table: CoreTable<TData>; rowHeight: number }) {
  return (
    <tr className="font-medium" style={{ height: rowHeight }}>
      {totalsRow(table).map((slot) =>
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
                <AggregationSymbol mark={slot.total.mark} className="mr-1.5" />
                {slot.total.text}
              </>
            )}
          </td>
        )
      )}
    </tr>
  );
}
