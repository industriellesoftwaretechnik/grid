import { cn } from 'cn';

import { ColumnFilter } from '#/grid/filters/ColumnFilter.tsx';
import { ColumnGroupHeader } from '#/grid/header/ColumnGroupHeader.tsx';
import { ColumnMenu } from '#/grid/header/ColumnMenu.tsx';
import { ColumnResizer } from '#/grid/header/ColumnResizer.tsx';
import { HeaderLabel } from '#/grid/header/HeaderLabel.tsx';
import { flexAlign, pinnedClassName } from '#/grid/styles.ts';
import { useHeaderCell, type GridInstance, type HeaderSlot } from '@istec/grid-core';

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
        'group relative text-left align-middle font-medium whitespace-nowrap text-foreground',
        kind === 'group' && 'border-b',
        pinnedClassName(region, edge),
        'bg-muted',
        reorderable &&
          'outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary focus-visible:outline-solid',
        isDragging && 'z-20 bg-background opacity-90 shadow-sm',
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
            'flex h-full items-center px-2',
            slot.filtered && (align === 'end' ? 'pl-8' : 'pr-8'),
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
