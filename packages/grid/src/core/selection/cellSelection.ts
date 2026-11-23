import type { CellSelectionBounds, CellSelectionRange, RowData } from '@tanstack/react-table';

import { parseCellText } from '#/core/columns/columnEditor.ts';
import { formatValue } from '#/core/columns/format.ts';
import type { CellValueInput } from '#/core/plugins/cellEditingFeature.ts';
import { repeatSource } from '#/core/selection/cellRanges.ts';
import { displayedColumns } from '#/core/selection/gridCells.ts';
import type { CoreTable } from '#/core/table/types.ts';

export function rangeOf<TData extends RowData>(
  table: CoreTable<TData>,
  bounds: CellSelectionBounds
): CellSelectionRange | undefined {
  const rows = table.getRowsInDisplayOrder();
  const columns = displayedColumns(table);
  const anchorRow = rows[bounds.minRowIndex];
  const anchorColumn = columns[bounds.minColumnIndex];
  const focusRow = rows[bounds.maxRowIndex];
  const focusColumn = columns[bounds.maxColumnIndex];
  if (!anchorRow || !anchorColumn || !focusRow || !focusColumn) return undefined;
  return {
    anchorRowId: anchorRow.id,
    anchorColumnId: anchorColumn.id,
    focusRowId: focusRow.id,
    focusColumnId: focusColumn.id,
  };
}

/** The values a fill handle writes: the cells of `target` outside `source` repeat the source block. */
export function fillValues<TData extends RowData>(
  table: CoreTable<TData>,
  source: CellSelectionBounds,
  target: CellSelectionBounds
): CellValueInput[] {
  const rows = table.getRowsInDisplayOrder();
  const columns = displayedColumns(table);
  return repeatSource(source, target).flatMap((copy) => {
    const row = rows[copy.rowIndex];
    const sourceRow = rows[copy.sourceRowIndex];
    const column = columns[copy.columnIndex];
    const sourceColumn = columns[copy.sourceColumnIndex];
    if (!row || !sourceRow || !column || !sourceColumn || sourceRow.getIsGrouped()) return [];
    const value = sourceRow.getValue(sourceColumn.id);
    if (sourceColumn === column) return [{ rowId: row.id, columnId: column.id, value }];
    // Into another column the value goes as its text, the way a paste would, so it gets that column's type.
    const parsed = parseCellText(column, formatValue(value, sourceColumn));
    return 'value' in parsed ? [{ rowId: row.id, columnId: column.id, value: parsed.value }] : [];
  });
}

export interface SelectionSummary {
  count: number;
  /** Over the numbers among the values; `undefined` when there are none. */
  sum?: number;
  average?: number;
}

/** The number of selected cells and the sum and average of their numbers, for a range of more than one cell. */
export function selectionSummary<TData extends RowData>(table: CoreTable<TData>): SelectionSummary {
  const count = table.getSelectedCellCount();
  if (count < 2) return { count };
  const rows = table.getRowsInDisplayOrder();
  const columns = displayedColumns(table);
  // Group rows are left out: their aggregated values would count their rows twice.
  const numbers = table.getCellSelectionBounds().flatMap((bounds) =>
    rows
      .slice(bounds.minRowIndex, bounds.maxRowIndex + 1)
      .filter((row) => !row.getIsGrouped() && row.getIsPinned() === false)
      .flatMap((row) =>
        columns
          .slice(bounds.minColumnIndex, bounds.maxColumnIndex + 1)
          .map((column) => row.getValue(column.id))
          .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
      )
  );
  if (numbers.length === 0) return { count };
  const sum = numbers.reduce((total, value) => total + value, 0);
  return { count, sum, average: sum / numbers.length };
}
