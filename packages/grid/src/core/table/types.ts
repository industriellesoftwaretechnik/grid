import type { Cell, CellData, Column, ColumnDef, Header, Row, RowData, Table, TableState } from '@tanstack/react-table';

import type { GridFeatures } from '#/core/table/features.ts';

export type { GridFeatures };

/** The TanStack table with the grid features; `GridInstance` is its React wrapper. */
export type CoreTable<TData extends RowData> = Table<GridFeatures, TData>;
/** A column definition with the grid features' options and `GridColumnMeta` as `meta`. */
export type GridColumnDef<TData extends RowData, TValue extends CellData = CellData> = ColumnDef<
  GridFeatures,
  TData,
  TValue
>;
/** A TanStack column with the grid features. */
export type GridColumn<TData extends RowData, TValue extends CellData = CellData> = Column<GridFeatures, TData, TValue>;
/** A TanStack header with the grid features. */
export type GridHeader<TData extends RowData> = Header<GridFeatures, TData>;
/** A TanStack row with the grid features. */
export type GridRow<TData extends RowData> = Row<GridFeatures, TData>;
/** A TanStack cell with the grid features. */
export type GridCell<TData extends RowData> = Cell<GridFeatures, TData>;

/** The table state of all grid features. */
export type GridState = TableState<GridFeatures>;
