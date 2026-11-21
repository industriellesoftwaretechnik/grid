import type { RowData } from '@tanstack/react-table';

import { groupColumnId } from '#/columns/groupColumn.tsx';
import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable, GridCell, GridColumn, GridRow } from '#/core/types.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { formatValue } from '#/logic/format.ts';
import { anchorOf, singleBlock, type CellPosition } from '#/logic/selection/cellRanges.ts';

export function focusedPosition<TData extends RowData>(table: CoreTable<TData>): CellPosition | null {
  return anchorOf(table.atoms.cellSelection.get());
}

/** The rows and columns of a selected range of more than one cell, while the selection is one rectangle. */
export function selectedBlock<TData extends RowData>(
  table: CoreTable<TData>
): { rows: GridRow<TData>[]; columns: GridColumn<TData>[] } | undefined {
  const block = singleBlock(table.getCellSelectionBounds());
  if (!block) return undefined;
  return {
    rows: table.getRowsInDisplayOrder().slice(block.minRowIndex, block.maxRowIndex + 1),
    columns: displayedColumns(table).slice(block.minColumnIndex, block.maxColumnIndex + 1),
  };
}

/** The rows in the order they are shown: pinned top, scrolling, pinned bottom. */
export function displayedRows<TData extends RowData>(table: CoreTable<TData>): GridRow<TData>[] {
  return [...table.getTopRows(), ...table.getCenterRows(), ...table.getBottomRows()];
}

/** The visible columns in the order they are shown: pinned start, scrolling, pinned end. */
export function displayedColumns<TData extends RowData>(table: CoreTable<TData>): GridColumn<TData>[] {
  return [
    ...table.getStartVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getEndVisibleLeafColumns(),
  ];
}

export function findCell<TData extends RowData>(
  table: CoreTable<TData>,
  position: CellPosition | null
): GridCell<TData> | undefined {
  if (!position) return undefined;
  const row = table.getRowModel().rowsById[position.rowId];
  return row?.getAllCells().find((cell) => cell.column.id === position.columnId);
}

/**
 * The column whose cells hold the toggles of tree nodes and master rows: the group column while it is shown, otherwise
 * `expandColumn`, or the first shown data column while that one is hidden, such as after grouping by it.
 */
export function rowToggleColumnId<TData extends RowData>(table: CoreTable<TData>): string | undefined {
  const { expandColumn } = gridMeta(table);
  if (expandColumn === undefined) return undefined;
  const shown = displayedColumns(table);
  if (shown.some((column) => column.id === groupColumnId)) return groupColumnId;
  if (shown.some((column) => column.id === expandColumn)) return expandColumn;
  return shown.find((column) => column.accessorFn !== undefined)?.id;
}

/** Whether the cell holds the toggle of its tree node or master row. */
export function holdsRowToggle<TData extends RowData>(cell: GridCell<TData>): boolean {
  return !cell.row.getIsGrouped() && rowToggleColumnId(cell.table) === cell.column.id;
}

/** Columns with a value, which copy and export include; display columns such as the checkboxes are left out. */
export function valueColumns<TData extends RowData>(table: CoreTable<TData>): GridColumn<TData>[] {
  return displayedColumns(table).filter((column) => column.accessorFn !== undefined);
}

export function rowsAsText<TData extends RowData>(
  rows: readonly GridRow<TData>[],
  columns: readonly GridColumn<TData>[],
  withHeaders: boolean
): string[][] {
  const body = rows.map((row) => columns.map((column) => formatValue(row.getValue(column.id), column)));
  return withHeaders ? [columns.map((column) => columnLabel(column)), ...body] : body;
}

/** The selected data rows in the order they are shown, without group rows. */
export function selectedLeafRows<TData extends RowData>(table: CoreTable<TData>): GridRow<TData>[] {
  return table.getSortedRowModel().flatRows.filter((row) => !row.getIsGrouped() && row.getIsSelected());
}

/** The data rows that pass the filters, sorted, without group rows. */
export function filteredLeafRows<TData extends RowData>(table: CoreTable<TData>): GridRow<TData>[] {
  return table.getSortedRowModel().flatRows.filter((row) => !row.getIsGrouped());
}
