import type { CellPosition } from '#/core/selection/cellRanges.ts';
import type { IdList } from '#/core/selection/gridCells.ts';

export type FocusMove =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'rowStart'
  | 'rowEnd'
  | 'top'
  | 'bottom'
  | 'first'
  | 'last'
  | 'pageUp'
  | 'pageDown'
  | 'next'
  | 'previous';

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

/** `next` and `previous` wrap across rows and return `null` past the ends, so Tab can leave the grid. */
export function moveFocus(
  rowIds: IdList,
  columnIds: readonly string[],
  from: CellPosition | null,
  move: FocusMove,
  pageSize: number
): CellPosition | null {
  const lastRow = rowIds.length - 1;
  const lastColumn = columnIds.length - 1;
  if (lastRow < 0 || lastColumn < 0) return null;

  const fromRow = from ? rowIds.indexOf(from.rowId) : -1;
  const fromColumn = from ? columnIds.indexOf(from.columnId) : -1;
  if (fromRow === -1) return at(rowIds, columnIds, 0, Math.max(fromColumn, 0));
  const column = Math.max(fromColumn, 0);

  switch (move) {
    case 'up':
      return at(rowIds, columnIds, clamp(fromRow - 1, lastRow), column);
    case 'down':
      return at(rowIds, columnIds, clamp(fromRow + 1, lastRow), column);
    case 'left':
      return at(rowIds, columnIds, fromRow, clamp(column - 1, lastColumn));
    case 'right':
      return at(rowIds, columnIds, fromRow, clamp(column + 1, lastColumn));
    case 'rowStart':
      return at(rowIds, columnIds, fromRow, 0);
    case 'rowEnd':
      return at(rowIds, columnIds, fromRow, lastColumn);
    case 'top':
      return at(rowIds, columnIds, 0, column);
    case 'bottom':
      return at(rowIds, columnIds, lastRow, column);
    case 'first':
      return at(rowIds, columnIds, 0, 0);
    case 'last':
      return at(rowIds, columnIds, lastRow, lastColumn);
    case 'pageUp':
      return at(rowIds, columnIds, clamp(fromRow - pageSize, lastRow), column);
    case 'pageDown':
      return at(rowIds, columnIds, clamp(fromRow + pageSize, lastRow), column);
    case 'next':
    case 'previous': {
      const index = fromRow * columnIds.length + column + (move === 'next' ? 1 : -1);
      return index < 0 || index > lastRow * columnIds.length + lastColumn
        ? null
        : at(rowIds, columnIds, Math.floor(index / columnIds.length), index % columnIds.length);
    }
    default:
      return null;
  }
}

function at(rowIds: IdList, columnIds: readonly string[], row: number, column: number) {
  const rowId = rowIds.at(row);
  const columnId = columnIds[column];
  return rowId === undefined || columnId === undefined ? null : { rowId, columnId };
}

const keyMoves: Record<string, FocusMove> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Home: 'rowStart',
  End: 'rowEnd',
  PageUp: 'pageUp',
  PageDown: 'pageDown',
};

const ctrlKeyMoves: Record<string, FocusMove> = {
  ArrowUp: 'top',
  ArrowDown: 'bottom',
  ArrowLeft: 'rowStart',
  ArrowRight: 'rowEnd',
  Home: 'first',
  End: 'last',
};

export function keyToMove(event: { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) {
  if (event.key === 'Tab') return event.shiftKey ? 'previous' : 'next';
  return event.ctrlKey || event.metaKey ? ctrlKeyMoves[event.key] : keyMoves[event.key];
}
