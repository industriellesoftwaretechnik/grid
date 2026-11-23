import type { RowData } from '@tanstack/react-table';

import { parseCellText } from '#/core/columns/columnEditor.ts';
import { columnLabel } from '#/core/columns/columnInfo.ts';
import { formatValue } from '#/core/columns/format.ts';
import type { CellValueInput, CellValueRejection } from '#/core/plugins/cellEditingFeature.ts';
import {
  displayedColumns,
  displayedRows,
  findCell,
  focusedPosition,
  rowsAsText,
  selectedBlock,
  selectedLeafRows,
  valueColumns,
} from '#/core/selection/gridCells.ts';
import { formatDelimited, parseDelimited } from '#/core/shared/delimited.ts';
import type { CoreTable, GridColumn, GridRow } from '#/core/table/types.ts';

/** The selected range, else the selected rows, else the focused cell, as spreadsheets copy them. */
export function copyText<TData extends RowData>(table: CoreTable<TData>, withHeaders = false): string | undefined {
  const block = selectedBlock(table);
  if (block) {
    const columns = block.columns.filter((column) => column.accessorFn !== undefined);
    return formatDelimited(rowsAsText(block.rows, columns, withHeaders), '\t');
  }
  const selected = selectedLeafRows(table);
  if (selected.length > 0) return formatDelimited(rowsAsText(selected, valueColumns(table), withHeaders), '\t');
  const cell = findCell(table, focusedPosition(table));
  if (!cell) return undefined;
  const value = formatValue(cell.getValue(), cell.column);
  return formatDelimited(withHeaders ? [[columnLabel(cell.column)], [value]] : [[value]], '\t');
}

function parsedInput<TData extends RowData>(rowId: string, column: GridColumn<TData>, text: string) {
  const parsed = parseCellText(column, text);
  return 'value' in parsed ? [{ rowId, columnId: column.id, value: parsed.value }] : [];
}

function fillBlock<TData extends RowData>(
  rows: readonly GridRow<TData>[],
  columns: readonly GridColumn<TData>[],
  text: (rowOffset: number, columnOffset: number) => string | undefined
): CellValueInput[] {
  // Copy leaves out display columns such as the checkboxes, so pasted text lines up without them.
  const values = columns.filter((column) => column.accessorFn !== undefined);
  return rows.flatMap((row, rowOffset) =>
    values.flatMap((column, columnOffset) => {
      const cellText = text(rowOffset, columnOffset);
      return cellText === undefined ? [] : parsedInput(row.id, column, cellText);
    })
  );
}

/**
 * Pastes spreadsheet text as one undoable edit: into a selected range that it fits, repeated to fill it; else from the
 * range's or the focused cell's top-left, rightwards and down. A single value pasted into a selected row goes into the
 * focused column of every selected row. Cells that cannot be edited or read the text are skipped.
 */
export function pasteText<TData extends RowData>(table: CoreTable<TData>, text: string): CellValueRejection[] {
  const focused = focusedPosition(table);
  if (!focused) return [];
  const values = parseDelimited(text, '\t');
  const height = values.length;
  const width = values[0]?.length ?? 0;
  if (height === 0 || width === 0) return [];

  const block = selectedBlock(table);
  const blockWidth = block?.columns.filter((column) => column.accessorFn !== undefined).length ?? 0;
  if (block && block.rows.length >= height && blockWidth >= width) {
    return table.setCellValues(
      fillBlock(block.rows, block.columns, (row, column) => values[row % height]?.[column % width])
    );
  }

  const start = block ? { rowId: block.rows[0]?.id, columnId: block.columns[0]?.id } : focused;
  const rows = displayedRows(table);
  const columns = displayedColumns(table);
  const startRow = rows.findIndex((row) => row.id === start.rowId);
  const startColumn = columns.findIndex((column) => column.id === start.columnId);
  if (startRow === -1 || startColumn === -1) return [];

  const single = height === 1 && width === 1 ? values[0]?.[0] : undefined;
  const selected = selectedLeafRows(table);
  if (single !== undefined && !block && selected.some((row) => row.id === focused.rowId)) {
    const column = columns[startColumn];
    return column ? table.setCellValues(selected.flatMap((row) => parsedInput(row.id, column, single))) : [];
  }
  return table.setCellValues(
    fillBlock(
      rows.slice(startRow, startRow + height),
      columns.slice(startColumn),
      (row, column) => values[row]?.[column]
    )
  );
}

/** Clears the editable cells of the selected range, or the focused cell, as one undoable edit. */
export function clearCells<TData extends RowData>(table: CoreTable<TData>): CellValueRejection[] {
  const block = selectedBlock(table);
  if (block) return table.setCellValues(fillBlock(block.rows, block.columns, () => ''));
  const focused = focusedPosition(table);
  const column = focused ? table.getColumn(focused.columnId) : undefined;
  return focused && column ? table.setCellValues(parsedInput(focused.rowId, column, '')) : [];
}
