import type { CellSelectionBounds, RowData } from '@tanstack/react-table';

import { fillBounds } from '#/core/selection/cellRanges.ts';
import { fillValues, rangeOf } from '#/core/selection/cellSelection.ts';
import type { CoreTable, GridCell } from '#/core/table/types.ts';

interface FillDrag {
  source: CellSelectionBounds;
  target: CellSelectionBounds;
}

// One drag at a time per table; like TanStack's own drag flag, it is not state, since nothing renders from it.
const drags = new WeakMap<object, FillDrag>();

function select<TData extends RowData>(table: CoreTable<TData>, bounds: CellSelectionBounds) {
  const range = rangeOf(table, bounds);
  if (range) table.setCellSelection([range]);
}

/** Releasing the mouse writes the values as one undoable edit. */
export function startFillDrag<TData extends RowData>(table: CoreTable<TData>) {
  const [source, ...others] = table.getCellSelectionBounds();
  if (!source || others.length > 0) return;
  drags.set(table, { source, target: source });
  const finish = () => {
    document.removeEventListener('mouseup', finish);
    const drag = drags.get(table);
    drags.delete(table);
    if (!drag || drag.target === drag.source) return;
    table.setCellValues(fillValues(table, drag.source, drag.target));
  };
  document.addEventListener('mouseup', finish);
}

/** Returns whether a fill drag is going on. */
export function extendFillDrag<TData extends RowData>(cell: GridCell<TData>): boolean {
  const { table } = cell;
  const drag = drags.get(table);
  if (!drag) return false;
  const rowIndex = cell.row.getDisplayIndex();
  const columnIndex = table.getCellSelectionColumnIndexes()[cell.column.id];
  if (rowIndex < 0 || columnIndex === undefined) return true;
  drag.target = fillBounds(drag.source, rowIndex, columnIndex);
  select(table, drag.target);
  return true;
}
