import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable, GridCell, GridColumn, GridRow } from '#/core/types.ts';
import { columnLabel, columnMeta } from '#/logic/columns/columnInfo.ts';
import { editorKindByDataType, parseEditorText, type EditorKind } from '#/logic/editing/editorValue.ts';
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

/** Whether the cell holds the toggle of its tree node or master row. */
export function holdsRowToggle<TData extends RowData>(cell: GridCell<TData>): boolean {
  return gridMeta(cell.table).expandColumn === cell.column.id && !cell.row.getIsGrouped();
}

export function editorKindOf<TData extends RowData>(column: GridColumn<TData>): EditorKind {
  const meta = columnMeta(column);
  return typeof meta.editor === 'string' ? meta.editor : editorKindByDataType[meta.dataType];
}

export function editorOptions<TData extends RowData>(column: GridColumn<TData>): readonly unknown[] {
  const meta = column.columnDef.meta;
  if (meta?.options) return meta.options;
  return [...column.getFacetedUniqueValues().keys()]
    .filter((value) => value !== null && value !== undefined)
    .toSorted((a, b) => formatValue(a, column).localeCompare(formatValue(b, column)));
}

/** Reads typed or pasted text as a value of the column. */
export function parseCellText<TData extends RowData>(column: GridColumn<TData>, text: string) {
  const kind = editorKindOf(column);
  return parseEditorText(text, kind, kind === 'select' ? editorOptions(column) : [], (value) =>
    formatValue(value, column)
  );
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
