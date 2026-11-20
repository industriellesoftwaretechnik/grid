import type { CSSProperties } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable, GridColumn } from '#/core/types.ts';
import { columnMeta, showsTotal } from '#/logic/columns/columnInfo.ts';
import type { ColumnAlign } from '#/logic/columns/columnMeta.ts';
import { formatAggregate } from '#/logic/format.ts';
import { aggregationSymbols, isAggregationName } from '#/logic/grouping/aggregations.ts';
import { cellStickyStyle, columnLayout, type Region } from '#/logic/layout.ts';

/** The short sign of an aggregation, such as Σ, and its name for a tooltip. */
export interface AggregationMark {
  symbol: string;
  name: string;
}

/** The mark of a column's aggregation; none for a custom aggregation function. */
export function aggregationMark<TData extends RowData>(
  table: CoreTable<TData>,
  aggregation: unknown
): AggregationMark | undefined {
  if (!isAggregationName(aggregation)) return undefined;
  return { symbol: aggregationSymbols[aggregation], name: gridMeta(table).t(`aggregation.${aggregation}`) };
}

export interface TotalsCell<TData extends RowData> {
  column: GridColumn<TData>;
  region: Region;
  edge: boolean;
  style: CSSProperties | undefined;
  align: ColumnAlign;
  /** Set for columns with an aggregation. A mean or a count is no sum, so each value carries its mark. */
  total?: { mark?: AggregationMark; text: string };
}

/** The footer row with the totals of the aggregated columns; `'filler'` takes the spare width. */
export function totalsRow<TData extends RowData>(table: CoreTable<TData>): (TotalsCell<TData> | 'filler')[] {
  return columnLayout(table).map((slot) => {
    if (slot === 'filler') return slot;
    const { item: column, region, index, edge } = slot;
    const { aggregationFn } = column.columnDef;
    return {
      column,
      region,
      edge,
      style: cellStickyStyle(region, index),
      align: columnMeta(column).align,
      total: showsTotal(column)
        ? {
            mark: aggregationMark(table, aggregationFn),
            text: formatAggregate(column.getAggregationValue(), column),
          }
        : undefined,
    };
  });
}
