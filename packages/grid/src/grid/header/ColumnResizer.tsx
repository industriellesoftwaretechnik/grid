import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import type { GridHeader } from '#/core/types.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';

/** The divider at a header's right edge; it is the resize handle where the column can be resized. */
export function ColumnResizer<TData extends RowData>({ header }: { header: GridHeader<TData> }) {
  const { column } = header;
  const { canResize, resizing } = useGridSelector(column.table, () => ({
    // Column groups resize through their columns.
    canResize: column.getCanResize() && header.subHeaders.length === 0,
    resizing: column.table.atoms.columnResizing.get().isResizingColumn === column.id,
  }));
  const line = (
    <div
      className={cn(
        'ig:h-1/2 ig:w-px ig:bg-border ig:transition-[height]',
        resizing ? 'ig:h-full ig:bg-primary' : 'ig:group-hover/divider:h-full ig:group-hover/divider:bg-primary/60'
      )}
    />
  );

  if (!canResize)
    return <div className="ig:absolute ig:top-0 ig:-right-px ig:flex ig:h-full ig:items-center">{line}</div>;

  return (
    <div
      aria-hidden
      // Keeps the press from starting a column drag.
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => header.getResizeHandler()(event)}
      onTouchStart={(event) => header.getResizeHandler()(event)}
      onDoubleClick={() => column.resetSize()}
      className="ig:group/divider ig:absolute ig:top-0 ig:-right-1.5 ig:z-10 ig:flex ig:h-full ig:w-3 ig:cursor-col-resize ig:touch-none ig:items-center ig:justify-center ig:select-none"
    >
      {line}
    </div>
  );
}
