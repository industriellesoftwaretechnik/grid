import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { ListFilter } from 'lucide-react';

import type { GridColumn } from '#/core/types.ts';
import { FilterEditor } from '#/grid/filters/FilterEditor.tsx';
import { useColumnFilterButton } from '#/grid/filters/useFilterTriggers.ts';
import { Popover, PopoverContent, PopoverTrigger } from '#/internal/components/popover.tsx';

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
          'ig:absolute ig:top-1/2 ig:flex ig:size-5 ig:-translate-y-1/2 ig:items-center ig:justify-center ig:rounded-sm',
          side === 'start' ? 'ig:left-2' : 'ig:right-2',
          filtered
            ? 'ig:bg-primary/15 ig:text-primary ig:hover:bg-primary/25'
            : 'ig:bg-muted ig:text-muted-foreground ig:opacity-0 ig:group-hover:opacity-100 ig:hover:text-foreground ig:focus-visible:opacity-100 ig:aria-expanded:opacity-100 ig:pointer-coarse:opacity-100'
        )}
      >
        <ListFilter className="ig:size-3.5" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="ig:w-64 ig:gap-2 ig:p-2"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <FilterEditor column={column} kind={filter} />
      </PopoverContent>
    </Popover>
  );
}
