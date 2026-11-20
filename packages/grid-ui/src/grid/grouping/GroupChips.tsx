import { cn } from 'cn';
import { ArrowDown, ArrowUp, ChevronRight, GripVertical, Group, X } from 'lucide-react';

import {
  columnLabel,
  GroupChipList,
  useGroupChip,
  type GridColumn,
  type GridInstance,
  type GroupChip,
} from '@istec/grid-core';

const sortIcons = { asc: <ArrowUp />, desc: <ArrowDown /> };

/** The grouped columns as chips in their level order. */
export function GroupChips<TData extends object>({
  table,
  pending,
}: {
  table: GridInstance<TData>;
  pending?: GridColumn<TData>;
}) {
  return (
    <div className="flex items-center gap-5 pl-1">
      <GroupChipList
        table={table}
        pending={pending}
        renderChip={(chip) => <SortableChip key={chip.column.id} chip={chip} />}
        renderPending={(column, first) => <PendingChip key="pending" column={column} first={first} />}
        renderOverlay={(column) => (
          <span className="flex h-6 w-fit items-center gap-1 rounded-md border bg-background px-2 font-medium shadow-md">
            <GripVertical className="size-3.5 text-muted-foreground" />
            {columnLabel(column)}
          </span>
        )}
      />
    </div>
  );
}

// The arrow before a chip sits in the gap, outside the chip's width, so the widths the drag measured stay true.
function SortableChip<TData extends object>({ chip }: { chip: GroupChip<TData> }) {
  const { label, isDragging, reordering, nodeProps, handleProps, canSort, toggleSorting, remove } = useGroupChip(chip);

  return (
    <div {...nodeProps} className="relative flex items-center">
      {!chip.first && (
        <ChevronRight
          className={cn(
            'absolute top-1/2 -left-[17px] size-3.5 -translate-y-1/2 text-muted-foreground',
            reordering && 'invisible'
          )}
        />
      )}
      <span
        className={cn(
          'flex h-6 items-center rounded-md border bg-background pr-0.5 font-medium shadow-xs',
          isDragging && 'opacity-40'
        )}
      >
        <button
          type="button"
          {...handleProps}
          className="flex h-full cursor-grab touch-none items-center rounded-l-md px-0.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing [&_svg]:size-3.5"
        >
          <GripVertical />
        </button>
        <button
          type="button"
          disabled={!canSort}
          onClick={toggleSorting}
          className="flex h-full items-center gap-1 pr-1 enabled:cursor-pointer [&_svg]:size-3.5"
        >
          {label}
          {chip.sorted && (
            <span className="flex items-center">
              {sortIcons[chip.sorted]}
              {chip.sortPosition > 0 && (
                <span className="text-[10px] leading-none text-muted-foreground tabular-nums">{chip.sortPosition}</span>
              )}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label={remove.label}
          onClick={remove.onClick}
          className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </span>
    </div>
  );
}

function PendingChip<TData extends object>({ column, first }: { column: GridColumn<TData>; first: boolean }) {
  return (
    <div className="relative flex items-center">
      {!first && (
        <ChevronRight className="absolute top-1/2 -left-[17px] size-3.5 -translate-y-1/2 text-muted-foreground" />
      )}
      <span className="flex h-6 items-center gap-1 rounded-md border border-dashed border-primary/60 bg-background/60 px-2 font-medium text-muted-foreground">
        <Group className="size-3.5 text-primary" />
        {columnLabel(column)}
      </span>
    </div>
  );
}
