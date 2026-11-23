import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { aggregatedValue } from '#/grid/footer/totalsRow.ts';
import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';

/** An aggregated value in a group row, marked with its aggregation like the totals row. */
export function AggregatedCell<TData extends RowData>({
  column,
  value,
}: {
  column: GridColumn<TData>;
  value: unknown;
}) {
  const { mark, text } = aggregatedValue(column, value);
  return (
    <>
      <AggregationSymbol mark={mark} className="ig:mr-1.5" />
      {text}
    </>
  );
}
