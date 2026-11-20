import type { RowData } from '@tanstack/react-table';

import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';
import { aggregatedValue, type GridColumn } from '@istec/grid-core';

/** An aggregated value in a group row, marked with its aggregation like the totals row. */
export function AggregatedCell<TData extends RowData>({
  column,
  getValue,
}: {
  column: GridColumn<TData>;
  getValue: () => unknown;
}) {
  const { mark, text } = aggregatedValue(column, getValue());
  return (
    <>
      <AggregationSymbol mark={mark} className="mr-1.5" />
      {text}
    </>
  );
}
