import type { RowData } from '@tanstack/react-table';

import { AggregationSymbol } from '#/grid/grouping/AggregationSymbol.tsx';
import { aggregationMark, formatAggregate, type GridColumn } from '@istec/grid-core';

/** An aggregated value in a group row, marked with its aggregation like the totals row. */
export function AggregatedCell<TData extends RowData>({
  column,
  getValue,
}: {
  column: GridColumn<TData>;
  getValue: () => unknown;
}) {
  return (
    <>
      <AggregationSymbol mark={aggregationMark(column.table, column.columnDef.aggregationFn)} className="mr-1.5" />
      {formatAggregate(getValue(), column)}
    </>
  );
}
