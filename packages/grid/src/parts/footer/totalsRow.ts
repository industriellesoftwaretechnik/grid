import type { CSSProperties } from 'react';

import type { RowData } from '@tanstack/react-table';

import { columnMeta, showsTotal } from '#/core/columns/columnInfo.ts';
import type { ColumnAlign } from '#/core/columns/columnMeta.ts';
import { formatAggregate } from '#/core/columns/format.ts';
import { aggregationSymbols, isAggregationName } from '#/core/table/aggregations.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { cellStickyStyle, columnLayout, type Region } from '#/parts/view/layout.ts';

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

/** An aggregated value as text with the mark of its aggregation, for a group row's cell or a total. */
export function aggregatedValue<TData extends RowData>(
  column: GridColumn<TData>,
  value: unknown
): { mark?: AggregationMark; text: string } {
  return { mark: aggregationMark(column.table, column.columnDef.aggregationFn), text: formatAggregate(value, column) };
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

/** The footer row with the totals of the aggregated columns, re-rendering when they change. */
export function useTotalsRow<TData extends RowData>(table: CoreTable<TData>): (TotalsCell<TData> | 'filler')[] {
  return useGridSelector(table, () => totalsRow(table));
}

/** The footer row with the totals of the aggregated columns; `'filler'` takes the spare width. */
export function totalsRow<TData extends RowData>(table: CoreTable<TData>): (TotalsCell<TData> | 'filler')[] {
  return columnLayout(table).map((slot) => {
    if (slot === 'filler') return slot;
    const { item: column, region, index, edge } = slot;
    return {
      column,
      region,
      edge,
      style: cellStickyStyle(region, index),
      align: columnMeta(column).align,
      total: showsTotal(column) ? aggregatedValue(column, column.getAggregationValue()) : undefined,
    };
  });
}
