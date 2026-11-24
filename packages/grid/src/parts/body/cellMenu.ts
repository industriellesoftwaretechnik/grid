import type { RowData } from '@tanstack/react-table';

import { copyText, pasteText } from '#/core/selection/clipboard.ts';
import { findCell, focusedPosition, selectedBlock, selectedLeafRows } from '#/core/selection/gridCells.ts';
import { menuItem, type GridMenuSection } from '#/core/shared/menu.ts';
import type { CoreTable, GridCell } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

const writeClipboard = (text: string | undefined) => {
  if (text !== undefined) void navigator.clipboard.writeText(text);
};

/** The body's context menu: copy, copy with headers and paste, for the range or the focused cell. */
export function cellMenu<TData extends RowData>(table: CoreTable<TData>): GridMenuSection[] {
  const cell = findCell(table, focusedPosition(table));
  const canCopy = cell !== undefined || selectedLeafRows(table).length > 0 || selectedBlock(table) !== undefined;
  return [
    {
      id: 'clipboard',
      entries: [
        menuItem('copy', () => writeClipboard(copyText(table)), { disabled: !canCopy }),
        menuItem('copy.with-headers', () => writeClipboard(copyText(table, true)), { disabled: !canCopy }),
        menuItem('paste', () => void navigator.clipboard.readText().then((text) => pasteText(table, text)), {
          disabled: cell?.getCanEdit() !== true,
        }),
      ],
    },
  ];
}

export interface CellMenuModel<TData extends RowData> {
  /** The focused cell, which a right click focuses first; the app's own entries may act on it. */
  cell: GridCell<TData> | undefined;
  sections: GridMenuSection[];
}

/**
 * The context menu of the body, as data; it acts on the range or the focused cell. Add the app's own entries to
 * `sections` before rendering them.
 */
export function useCellMenu<TData extends RowData>(table: CoreTable<TData>): CellMenuModel<TData> {
  return useGridSelector(table, () => ({
    cell: findCell(table, focusedPosition(table)),
    sections: cellMenu(table),
  }));
}
