import type { RowData } from '@tanstack/react-table';

import { copyText, pasteText } from '#/core/selection/clipboard.ts';
import { findCell, focusedPosition, selectedBlock, selectedLeafRows } from '#/core/selection/gridCells.ts';
import { menuItem, type GridMenuSection } from '#/core/shared/menu.ts';
import type { CoreTable, GridCell } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

const writeClipboard = (text: string | undefined) => {
  if (text !== undefined) void navigator.clipboard.writeText(text);
};

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

/** What `useCellMenu` returns. */
export interface CellMenuModel<TData extends RowData> {
  /** The focused cell, unset while none is; a right click outside the range focuses its cell first. */
  cell: GridCell<TData> | undefined;
  /** Copy, copy with headers and paste. */
  sections: GridMenuSection[];
}

/** The body's context menu; it acts on the selected rows, the range or the focused cell. */
export function useCellMenu<TData extends RowData>(table: CoreTable<TData>): CellMenuModel<TData> {
  return useGridSelector(table, () => ({
    cell: findCell(table, focusedPosition(table)),
    sections: cellMenu(table),
  }));
}
