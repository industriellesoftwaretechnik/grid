import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { ListFilter } from 'lucide-react';

import { FilterEditor } from '#/grid/filters/FilterEditor.tsx';
import { pinnedClassName } from '#/grid/styles.ts';
import { Popover, PopoverContent, PopoverTrigger } from '#/internal/components/popover.tsx';
import { headerRows, useFloatingFilter, type GridColumn, type GridInstance } from '@istec/grid-core';

const fieldClassName =
  'h-6 w-full min-w-0 rounded-sm border bg-background px-1.5 font-normal outline-none focus-visible:ring-1 focus-visible:ring-primary aria-invalid:border-destructive';

/** The row under the header with a filter per column. */
export function FloatingFilterRow<TData extends object>({
  table,
  height,
}: {
  table: GridInstance<TData>;
  height: number;
}) {
  const leafRow = headerRows(table).at(-1);
  if (!leafRow) return null;

  return (
    <tr>
      {leafRow.slots.map((slot) =>
        slot === 'filler' ? (
          <th key="filler" aria-hidden className="border-t" />
        ) : (
          <th
            key={slot.header.id}
            style={{ height, ...slot.style }}
            className={cn('border-t px-1 align-middle', pinnedClassName(slot.region, slot.edge), 'bg-muted')}
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
        className={cn(fieldClassName, 'flex cursor-pointer items-center gap-1 text-left')}
      >
        <span className="min-w-0 flex-1 truncate">{filter.summary}</span>
        <ListFilter
          className={cn('size-3.5 shrink-0', filter.summary === '' ? 'text-muted-foreground' : 'text-primary')}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 gap-2 p-2">
        <FilterEditor column={column} kind={filter.filter} />
      </PopoverContent>
    </Popover>
  );
}
