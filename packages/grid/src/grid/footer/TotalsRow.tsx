import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import type { CoreTable } from '#/core/types.ts';
import { useTotalsRow } from '#/grid/footer/totalsRow.ts';
import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';
import { pinnedClassName, textAlign } from '#/grid/styles.ts';

/** The footer row with the totals of the aggregated columns. */
export function TotalsRow<TData extends RowData>({ table, rowHeight }: { table: CoreTable<TData>; rowHeight: number }) {
  const slots = useTotalsRow(table);

  return (
    <tr className="ig:font-medium" style={{ height: rowHeight }}>
      {slots.map((slot) =>
        slot === 'filler' ? (
          <td key="filler" aria-hidden />
        ) : (
          <td
            key={slot.column.id}
            style={slot.style}
            className={cn(
              'ig:truncate ig:px-2 ig:align-middle ig:whitespace-nowrap',
              slot.total && textAlign[slot.align],
              pinnedClassName(slot.region, slot.edge)
            )}
          >
            {slot.total && (
              <>
                <AggregationSymbol mark={slot.total.mark} className="ig:mr-1.5" />
                {slot.total.text}
              </>
            )}
          </td>
        )
      )}
    </tr>
  );
}
