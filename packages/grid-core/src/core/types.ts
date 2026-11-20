import type { Cell, CellData, Column, ColumnDef, Header, Row, RowData, Table, TableState } from '@tanstack/react-table';

import type { GridFeatures } from '#/core/features.ts';
import type { GridExtraState } from '#/core/gridMeta.ts';

export type { GridFeatures };

/** The table that rows, columns, cells and headers point back to; `GridInstance` is its React wrapper. */
export type CoreTable<TData extends RowData> = Table<GridFeatures, TData>;
export type GridColumnDef<TData extends RowData, TValue extends CellData = CellData> = ColumnDef<
  GridFeatures,
  TData,
  TValue
>;
export type GridColumn<TData extends RowData, TValue extends CellData = CellData> = Column<GridFeatures, TData, TValue>;
export type GridHeader<TData extends RowData> = Header<GridFeatures, TData>;
export type GridRow<TData extends RowData> = Row<GridFeatures, TData>;
export type GridCell<TData extends RowData> = Cell<GridFeatures, TData>;

export type GridState = TableState<GridFeatures> & GridExtraState;
