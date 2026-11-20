import type { RowData } from '@tanstack/react-table';

import type { GridHeader } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/** The divider at a header's right edge; it is the resize handle where the column can be resized. */
export function useColumnResizer<TData extends RowData>(header: GridHeader<TData>) {
  'use no memo';
  const resizing = useGridSelector(
    header.column.table.atoms.columnResizing,
    (state) => state.isResizingColumn === header.column.id
  );
  const handler = header.getResizeHandler();

  return {
    /** Column groups resize through their columns. */
    canResize: header.column.getCanResize() && header.subHeaders.length === 0,
    resizing,
    handleProps: {
      'aria-hidden': true,
      // Keeps the press from starting a column drag.
      onPointerDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
      onMouseDown: handler,
      onTouchStart: handler,
      onDoubleClick: () => header.column.resetSize(),
    },
  };
}
