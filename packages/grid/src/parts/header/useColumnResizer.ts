import type { MouseEvent, TouchEvent } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridHeader } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** What `useColumnResizer` returns. */
export interface ColumnResizerModel {
  /** False for a column group, which resizes through its columns. */
  canResize: boolean;
  /** The column is being resized right now. */
  resizing: boolean;
  /** Props for the handle at the header's right edge; a double click returns the column to its defined width. */
  handleProps: {
    'aria-hidden': true;
    onMouseDown: (event: MouseEvent) => void;
    onTouchStart: (event: TouchEvent) => void;
    onDoubleClick: () => void;
  };
}

/** The resize handle of a header cell. */
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
