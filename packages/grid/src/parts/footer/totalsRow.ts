import type { CSSProperties } from 'react';

import type { RowData } from '@tanstack/react-table';

import { columnMeta, showsTotal } from '#/core/columns/columnInfo.ts';
import type { ColumnAlign } from '#/core/columns/columnMeta.ts';
import { formatAggregate } from '#/core/columns/format.ts';
import type { AggregationName } from '#/core/table/aggregations.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { cellStickyStyle, columnLayout, type Region } from '#/parts/view/layout.ts';

/**
 * An aggregated value as text, with its aggregation for the UI to mark it by, since a mean or a count is no sum;
 * unset for a custom aggregation function.
 */
export interface AggregatedValue {
  aggregation: AggregationName | undefined;
  text: string;
}

export function aggregatedValue<TData extends RowData>(column: GridColumn<TData>, value: unknown): AggregatedValue {
  return { aggregation: column.getAggregation(), text: formatAggregate(value, column) };
}

export interface TotalsCell<TData extends RowData> {
  column: GridColumn<TData>;
  region: Region;
  edge: boolean;
  style: CSSProperties | undefined;
  align: ColumnAlign;
  /** Set for columns with an aggregation. */
  total?: AggregatedValue;
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
