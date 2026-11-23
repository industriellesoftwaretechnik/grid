import type { MouseEvent, TouchEvent } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridHeader } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface ColumnResizerModel {
  /** Column groups resize through their columns. */
  canResize: boolean;
  resizing: boolean;
  /** For the handle at the header's right edge; a double click returns the column to its defined width. */
  handleProps: {
    'aria-hidden': true;
    onMouseDown: (event: MouseEvent) => void;
    onTouchStart: (event: TouchEvent) => void;
    onDoubleClick: () => void;
  };
}

/** The resize handle of a header. */
export function useColumnResizer<TData extends RowData>(header: GridHeader<TData>): ColumnResizerModel {
  const { column } = header;
  const { canResize, resizing } = useGridSelector(column.table, () => ({
    canResize: column.getCanResize() && header.subHeaders.length === 0,
    resizing: column.table.atoms.columnResizing.get().isResizingColumn === column.id,
  }));

  return {
    canResize,
    resizing,
    handleProps: {
      'aria-hidden': true,
      onMouseDown: (event) => header.getResizeHandler()(event),
      onTouchStart: (event) => header.getResizeHandler()(event),
      onDoubleClick: () => column.resetSize(),
    },
  };
}
