import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { CoreTable, GridColumn, GridRow } from '#/core/types.ts';

/**
 * The components core renders inside cells of its own columns. A UI layer passes them to `useGrid` once; everything
 * else it renders itself with the headless hooks, so column definitions work with any UI layer.
 */
export interface GridComponents {
  /** An aggregated value in a group row; `aggregatedValue` gives its mark and text. */
  AggregatedCell: <TData extends RowData>(props: { column: GridColumn<TData>; value: unknown }) => ReactNode;
  /** The header checkbox of `selectionColumn`; `useSelectAllCheckbox` gives its state. */
  SelectAllCheckbox: <TData extends RowData>(props: { table: CoreTable<TData> }) => ReactNode;
  /** The row checkbox of `selectionColumn`; `useRowCheckbox` gives its state. */
  RowCheckbox: <TData extends RowData>(props: { row: GridRow<TData> }) => ReactNode;
}
