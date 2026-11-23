import { cn } from 'cn';

import type { GridInstance } from '#/core/tableHook.tsx';
import { ColumnFilter } from '#/grid/filters/ColumnFilter.tsx';
import { ColumnGroupHeader } from '#/grid/header/ColumnGroupHeader.tsx';
import { ColumnMenu } from '#/grid/header/ColumnMenu.tsx';
import { ColumnResizer } from '#/grid/header/ColumnResizer.tsx';
import { HeaderLabel } from '#/grid/header/HeaderLabel.tsx';
import type { HeaderSlot } from '#/grid/header/headerRows.ts';
import { useHeaderCell } from '#/grid/header/useHeaderCell.ts';
import { flexAlign, pinnedClassName } from '#/grid/styles.ts';

export function HeaderCell<TData extends object>({
  table,
  slot,
  height,
}: {
  table: GridInstance<TData>;
  slot: HeaderSlot<TData>;
  height: number;
}) {
  const { kind, reorderable, isDragging, align, className, filterOpen, setFilterOpen, cellProps } = useHeaderCell(slot);
  const { header, region, edge } = slot;

  return (
    <th
      {...cellProps}
      style={{ height, ...cellProps.style }}
      className={cn(
        'ig:group ig:relative ig:text-left ig:align-middle ig:font-medium ig:whitespace-nowrap ig:text-foreground',
        kind === 'group' && 'ig:border-b',
        pinnedClassName(region, edge),
        'ig:bg-muted',
        reorderable &&
          'ig:outline-none ig:focus-visible:outline-1 ig:focus-visible:-outline-offset-1 ig:focus-visible:outline-primary ig:focus-visible:outline-solid',
        isDragging && 'ig:z-20 ig:bg-background ig:opacity-90 ig:shadow-sm',
        className
      )}
    >
      {kind === 'group' ? (
        <ColumnGroupHeader slot={slot} />
      ) : kind === 'column' ? (
        <ColumnMenu
          table={table}
          column={header.column}
          onFilter={() => setFilterOpen(true)}
          className={cn(
            'ig:flex ig:h-full ig:items-center ig:px-2',
            slot.filtered && (align === 'end' ? 'ig:pl-8' : 'ig:pr-8'),
            flexAlign[align]
          )}
        >
          <HeaderLabel slot={slot} />
          <ColumnFilter column={header.column} open={filterOpen} onOpenChange={setFilterOpen} />
        </ColumnMenu>
      ) : null}
      <ColumnResizer header={header} />
    </th>
  );
}
