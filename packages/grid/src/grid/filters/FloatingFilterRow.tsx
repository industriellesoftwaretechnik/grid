import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { ListFilter } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridColumn } from '#/core/types.ts';
import { FilterEditor } from '#/grid/filters/FilterEditor.tsx';
import { useFloatingFilter } from '#/grid/filters/useFilterTriggers.ts';
import { useHeaderRows } from '#/grid/header/headerRows.ts';
import { pinnedClassName } from '#/grid/styles.ts';
import { Popover, PopoverContent, PopoverTrigger } from '#/internal/components/popover.tsx';

const fieldClassName =
  'ig:h-6 ig:w-full ig:min-w-0 ig:rounded-sm ig:border ig:bg-background ig:px-1.5 ig:font-normal ig:outline-none ig:focus-visible:ring-1 ig:focus-visible:ring-primary ig:aria-invalid:border-destructive';

/** The row under the header with a filter per column. */
export function FloatingFilterRow<TData extends object>({
  table,
  height,
}: {
  table: GridInstance<TData>;
  height: number;
}) {
  const leafRow = useHeaderRows(table).at(-1);
  if (!leafRow) return null;

  return (
    <tr>
      {leafRow.slots.map((slot) =>
        slot === 'filler' ? (
          <th key="filler" aria-hidden className="ig:border-t" />
        ) : (
          <th
            key={slot.header.id}
            style={{ height, ...slot.style }}
            className={cn(
              'ig:border-t ig:px-1 ig:align-middle',
              pinnedClassName(slot.region, slot.edge),
              'ig:bg-muted'
            )}
          >
            <FloatingFilter column={slot.header.column} />
          </th>
        )
      )}
    </tr>
  );
}

function FloatingFilter<TData extends RowData>({ column }: { column: GridColumn<TData> }) {
  const filter = useFloatingFilter(column);
  if (filter.mode === 'none' || !filter.filter) return null;

  if (filter.mode === 'typed') {
    return (
      <input
        type="search"
        aria-label={filter.label}
        aria-invalid={filter.invalid || undefined}
        title={filter.hint}
        value={filter.text}
        onChange={(event) => filter.change(event.target.value)}
        className={fieldClassName}
      />
    );
  }

  return (
    <Popover open={filter.open} onOpenChange={filter.setOpen}>
      <PopoverTrigger
        aria-label={filter.label}
        title={filter.summary || undefined}
        className={cn(fieldClassName, 'ig:flex ig:cursor-pointer ig:items-center ig:gap-1 ig:text-left')}
      >
        <span className="ig:min-w-0 ig:flex-1 ig:truncate">{filter.summary}</span>
        <ListFilter
          className={cn(
            'ig:size-3.5 ig:shrink-0',
            filter.summary === '' ? 'ig:text-muted-foreground' : 'ig:text-primary'
          )}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="ig:w-64 ig:gap-2 ig:p-2">
        <FilterEditor column={column} kind={filter.filter} />
      </PopoverContent>
    </Popover>
  );
}
