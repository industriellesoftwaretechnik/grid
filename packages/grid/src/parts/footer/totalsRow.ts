import type { CSSProperties } from 'react';

import type { RowData } from '@tanstack/react-table';

import { columnMeta, showsTotal } from '#/core/columns/columnInfo.ts';
import type { ColumnAlign } from '#/core/columns/columnMeta.ts';
import { formatAggregate } from '#/core/columns/format.ts';
import type { AggregationName } from '#/core/table/aggregations.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { cellStickyStyle, columnLayout, type Region } from '#/parts/view/layout.ts';

/** An aggregated value as the column shows it. */
export interface AggregatedValue {
  /** Lets the UI mark the value, since a mean is no sum; unset for a custom aggregation function. */
  aggregation: AggregationName | undefined;
  text: string;
}

export function aggregatedValue<TData extends RowData>(column: GridColumn<TData>, value: unknown): AggregatedValue {
  return { aggregation: column.getAggregation(), text: formatAggregate(value, column) };
}

/** A cell of the totals row. */
export interface TotalsCell<TData extends RowData> {
  column: GridColumn<TData>;
  region: Region;
  /** The pinned cell next to the scrolling ones, which draws the border between them. */
  edge: boolean;
  /** Keeps a pinned cell in place; unset for a scrolling one. */
  style: CSSProperties | undefined;
  align: ColumnAlign;
  /** Set for columns with an aggregation. */
  total?: AggregatedValue;
}

/** The totals row, over the filtered rows: a cell per visible column; `'filler'` takes the spare width. */
export function useTotalsRow<TData extends RowData>(table: CoreTable<TData>): (TotalsCell<TData> | 'filler')[] {
  return useGridSelector(table, () => totalsRow(table));
}

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
