import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { ListFilter } from 'lucide-react';

import { FilterEditor } from '#/grid/filters/FilterEditor.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '#/internal/components/popover.tsx';
import { useColumnFilterButton, type GridColumn } from '@istec/grid-core';

/** The filter button in a header, which opens the column's filter editor. */
export function ColumnFilter<TData extends RowData>({
  column,
  open,
  onOpenChange,
}: {
  column: GridColumn<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { filter, filtered, side, label } = useColumnFilterButton(column);
  if (!filter) return null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={label}
        // Keeps the press from starting a column drag.
        onPointerDown={(event) => event.stopPropagation()}
        className={cn(
          'absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm',
          side === 'start' ? 'left-2' : 'right-2',
          filtered
            ? 'bg-primary/15 text-primary hover:bg-primary/25'
            : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 aria-expanded:opacity-100 pointer-coarse:opacity-100'
        )}
      >
        <ListFilter className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 gap-2 p-2" onPointerDown={(event) => event.stopPropagation()}>
        <FilterEditor column={column} kind={filter} />
      </PopoverContent>
    </Popover>
  );
}
