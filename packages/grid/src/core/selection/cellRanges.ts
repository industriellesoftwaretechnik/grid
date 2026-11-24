import type { CellSelectionBounds, CellSelectionState } from '@tanstack/react-table';

/** A cell by its row id and column id. */
export interface CellPosition {
  rowId: string;
  columnId: string;
}

export const samePosition = (a: CellPosition | null, b: CellPosition | null) =>
  a === b || (a !== null && b !== null && a.rowId === b.rowId && a.columnId === b.columnId);

/** As in spreadsheets, the focused cell is the latest range's anchor and stays in place when it extends. */
export function anchorOf(ranges: CellSelectionState): CellPosition | null {
  const active = ranges.at(-1);
  return active ? { rowId: active.anchorRowId, columnId: active.anchorColumnId } : null;
}

/** The corner Shift moves. */
export function freeCornerOf(ranges: CellSelectionState): CellPosition | null {
  const active = ranges.at(-1);
  return active ? { rowId: active.focusRowId, columnId: active.focusColumnId } : null;
}

export function extendLatestRange(ranges: CellSelectionState, to: CellPosition): CellSelectionState {
  const active = ranges.at(-1);
  if (!active) return ranges;
  return [...ranges.slice(0, -1), { ...active, focusRowId: to.rowId, focusColumnId: to.columnId }];
}

export const boundsHeight = (bounds: CellSelectionBounds) => bounds.maxRowIndex - bounds.minRowIndex + 1;
export const boundsWidth = (bounds: CellSelectionBounds) => bounds.maxColumnIndex - bounds.minColumnIndex + 1;

/** `undefined` for a single cell or disjoint regions. */
export function singleBlock(bounds: readonly CellSelectionBounds[]): CellSelectionBounds | undefined {
  const [only] = bounds;
  return bounds.length === 1 && only && boundsHeight(only) * boundsWidth(only) > 1 ? only : undefined;
}

const distance = (index: number, min: number, max: number) => Math.max(min - index, index - max, 0);

/** The source grows along the axis the drag moved further on. */
export function fillBounds(source: CellSelectionBounds, rowIndex: number, columnIndex: number): CellSelectionBounds {
  const rows = distance(rowIndex, source.minRowIndex, source.maxRowIndex);
  const columns = distance(columnIndex, source.minColumnIndex, source.maxColumnIndex);
  if (rows === 0 && columns === 0) return source;
  return rows >= columns
    ? {
        ...source,
        minRowIndex: Math.min(source.minRowIndex, rowIndex),
        maxRowIndex: Math.max(source.maxRowIndex, rowIndex),
      }
    : {
        ...source,
        minColumnIndex: Math.min(source.minColumnIndex, columnIndex),
        maxColumnIndex: Math.max(source.maxColumnIndex, columnIndex),
      };
}

export interface CellCopy {
  rowIndex: number;
  columnIndex: number;
  sourceRowIndex: number;
  sourceColumnIndex: number;
}

const wrap = (index: number, start: number, length: number) => start + ((((index - start) % length) + length) % length);

export function repeatSource(source: CellSelectionBounds, target: CellSelectionBounds): CellCopy[] {
  const copies: CellCopy[] = [];
  for (let rowIndex = target.minRowIndex; rowIndex <= target.maxRowIndex; rowIndex++) {
    for (let columnIndex = target.minColumnIndex; columnIndex <= target.maxColumnIndex; columnIndex++) {
      const inside =
        distance(rowIndex, source.minRowIndex, source.maxRowIndex) === 0 &&
        distance(columnIndex, source.minColumnIndex, source.maxColumnIndex) === 0;
      if (inside) continue;
      copies.push({
        rowIndex,
        columnIndex,
        sourceRowIndex: wrap(rowIndex, source.minRowIndex, boundsHeight(source)),
        sourceColumnIndex: wrap(columnIndex, source.minColumnIndex, boundsWidth(source)),
      });
    }
  }
  return copies;
}
