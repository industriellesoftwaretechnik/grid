import type { RowData } from '@tanstack/react-table';

import type { GridHeader } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/** The divider at a header's right edge; it is the resize handle where the column can be resized. */
export function useColumnResizer<TData extends RowData>(header: GridHeader<TData>) {
  const { column } = header;
  const { canResize, resizing } = useGridSelector(column.table, () => ({
    // Column groups resize through their columns.
    canResize: column.getCanResize() && header.subHeaders.length === 0,
    resizing: column.table.atoms.columnResizing.get().isResizingColumn === column.id,
  }));

  return {
    canResize,
    resizing,
    handleProps: {
      'aria-hidden': true,
      // Keeps the press from starting a column drag.
      onPointerDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
      onMouseDown: (event: unknown) => header.getResizeHandler()(event),
      onTouchStart: (event: unknown) => header.getResizeHandler()(event),
      onDoubleClick: () => column.resetSize(),
    },
  };
}
