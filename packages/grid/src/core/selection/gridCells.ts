import type { RowData } from '@tanstack/react-table';

import { columnLabel } from '#/core/columns/columnInfo.ts';
import { formatValue } from '#/core/columns/format.ts';
import { groupColumnId } from '#/core/columns/groupColumn.ts';
import { anchorOf, singleBlock, type CellPosition } from '#/core/selection/cellRanges.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable, GridCell, GridColumn, GridRow } from '#/core/table/types.ts';

export function focusedPosition<TData extends RowData>(table: CoreTable<TData>): CellPosition | null {
  return anchorOf(table.atoms.cellSelection.get());
}

/** Only for a selection of more than one cell that is one rectangle. */
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

export function displayedRows<TData extends RowData>(table: CoreTable<TData>): GridRow<TData>[] {
  return [...table.getTopRows(), ...table.getCenterRows(), ...table.getBottomRows()];
}

// The table builds new arrays when its rows change and never changes one, so an index stays true for its array.
const idIndexes = new WeakMap<readonly { id: string }[], Map<string, number>>();

export function indexOfId(items: readonly { id: string }[], id: string): number {
  let index = idIndexes.get(items);
  if (!index) {
    index = new Map(items.map((item, position) => [item.id, position]));
    idIndexes.set(items, index);
  }
  return index.get(id) ?? -1;
}

export interface IdList {
  readonly length: number;
  at: (index: number) => string | undefined;
  indexOf: (id: string) => number;
}

// Does not copy the rows, so a key press does not go through all of them.
export function displayedRowIds<TData extends RowData>(table: CoreTable<TData>): IdList {
  const parts = [table.getTopRows(), table.getCenterRows(), table.getBottomRows()];
  return {
    length: parts.reduce((count, part) => count + part.length, 0),
    at: (index) => {
      let offset = index;
      for (const part of parts) {
        if (offset < part.length) return part[offset]?.id;
        offset -= part.length;
      }
      return undefined;
    },
    indexOf: (id) => {
      let offset = 0;
      for (const part of parts) {
        const found = indexOfId(part, id);
        if (found !== -1) return offset + found;
        offset += part.length;
      }
      return -1;
    },
  };
}

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

export function rowToggleColumnId<TData extends RowData>(table: CoreTable<TData>): string | undefined {
  const { expandColumn } = gridMeta(table);
  if (expandColumn === undefined) return undefined;
  const shown = displayedColumns(table);
  if (shown.some((column) => column.id === groupColumnId)) return groupColumnId;
  if (shown.some((column) => column.id === expandColumn)) return expandColumn;
  return shown.find((column) => column.accessorFn !== undefined)?.id;
}

export function holdsRowToggle<TData extends RowData>(cell: GridCell<TData>): boolean {
  return !cell.row.getIsGrouped() && rowToggleColumnId(cell.table) === cell.column.id;
}

// Copy and export leave out display columns such as the checkboxes.
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

export function selectedLeafRows<TData extends RowData>(table: CoreTable<TData>): GridRow<TData>[] {
  return table.getSortedRowModel().flatRows.filter((row) => !row.getIsGrouped() && row.getIsSelected());
}

export function filteredLeafRows<TData extends RowData>(table: CoreTable<TData>): GridRow<TData>[] {
  return table.getSortedRowModel().flatRows.filter((row) => !row.getIsGrouped());
}
