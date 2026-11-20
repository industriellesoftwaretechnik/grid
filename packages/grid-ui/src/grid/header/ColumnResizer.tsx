import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';

import { useColumnResizer, type GridHeader } from '@istec/grid-core';

/** The divider at a header's right edge; it is the resize handle where the column can be resized. */
export function ColumnResizer<TData extends RowData>({ header }: { header: GridHeader<TData> }) {
  const { canResize, resizing, handleProps } = useColumnResizer(header);
  const line = (
    <div
      className={cn(
        'h-1/2 w-px bg-border transition-[height]',
        resizing ? 'h-full bg-primary' : 'group-hover/divider:h-full group-hover/divider:bg-primary/60'
      )}
    />
  );

  if (!canResize) return <div className="absolute top-0 -right-px flex h-full items-center">{line}</div>;

  return (
    <div
      {...handleProps}
      className="group/divider absolute top-0 -right-1.5 z-10 flex h-full w-3 cursor-col-resize touch-none items-center justify-center select-none"
    >
      {line}
    </div>
  );
}
