import { createContext, use, useState } from 'react';

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SortDirection } from '@tanstack/react-table';
import { cn } from 'cn';
import { ArrowDown, ArrowUp, ChevronRight, GripVertical, Group, X } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridColumn } from '#/core/types.ts';
import { useColumnDragAndDrop } from '#/hooks/useColumnDragAndDrop.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';

const sortIcons = { asc: <ArrowUp />, desc: <ArrowDown /> };

interface GroupChip<TData extends object> {
  column: GridColumn<TData>;
  /** The first level, which has no arrow before it. */
  first: boolean;
  sorted: false | SortDirection;
  /** The column's place in a multi-sort, from 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
}

/** While the levels are reordered, arrows between chips would point between the wrong ones, so they hide. */
const ReorderingContext = createContext(false);

/**
 * The grouped columns as chips in their level order, dragged sideways to reorder the levels. The chips have their own
 * drag and drop, apart from the header's. `pending` is a column dragged over the group panel, shown as the level it
 * would add.
 */
export function GroupChips<TData extends object>({
  table,
  pending,
}: {
  table: GridInstance<TData>;
  pending?: GridColumn<TData>;
}) {
  const { grouping, chips } = useGridSelector(table, () => {
    const levels = table.atoms.grouping.get();
    const sorting = table.atoms.sorting.get();
    return {
      grouping: levels,
      chips: levels.flatMap((columnId, index): GroupChip<TData>[] => {
        const column = table.getColumn(columnId);
        if (!column) return [];
        const sortIndex = sorting.findIndex((sort) => sort.id === columnId);
        const sort = sorting[sortIndex];
        return [
          {
            column,
            first: index === 0,
            sorted: sort ? (sort.desc ? 'desc' : 'asc') : false,
            sortPosition: sorting.length > 1 ? sortIndex + 1 : 0,
          },
        ];
      }),
    };
  });
  const [dragging, setDragging] = useState<string>();
  const dragAndDrop = useColumnDragAndDrop(({ active, over }) => {
    const current = table.atoms.grouping.get();
    const from = current.indexOf(String(active.id));
    const to = over ? current.indexOf(String(over.id)) : -1;
    if (from !== -1 && to !== -1 && from !== to) table.setGrouping(arrayMove(current, from, to));
  });
  const draggedColumn = dragging === undefined ? undefined : chips.find((chip) => chip.column.id === dragging)?.column;

  return (
    <div className="ig:flex ig:items-center ig:gap-5 ig:pl-1">
      <DndContext
        {...dragAndDrop}
        onDragStart={(event) => {
          dragAndDrop.onDragStart();
          setDragging(String(event.active.id));
        }}
        onDragCancel={() => {
          dragAndDrop.onDragCancel();
          setDragging(undefined);
        }}
        onDragEnd={(event) => {
          setDragging(undefined);
          dragAndDrop.onDragEnd(event);
        }}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
      >
        <ReorderingContext value={dragging !== undefined}>
          <SortableContext items={grouping} strategy={horizontalListSortingStrategy}>
            {chips.map((chip) => (
              <SortableChip key={chip.column.id} chip={chip} />
            ))}
            {pending && <PendingChip key="pending" column={pending} first={grouping.length === 0} />}
          </SortableContext>
        </ReorderingContext>
        <DragOverlay dropAnimation={null}>
          {draggedColumn && (
            <span className="ig:flex ig:h-6 ig:w-fit ig:items-center ig:gap-1 ig:rounded-md ig:border ig:bg-background ig:px-2 ig:font-medium ig:shadow-md">
              <GripVertical className="ig:size-3.5 ig:text-muted-foreground" />
              {columnLabel(draggedColumn)}
            </span>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// The arrow before a chip sits in the gap, outside the chip's width, so the widths the drag measured stay true.
function SortableChip<TData extends object>({ chip }: { chip: GroupChip<TData> }) {
  const { column } = chip;
  const reordering = use(ReorderingContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });
  const t = useTranslate(column.table);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="ig:relative ig:flex ig:items-center"
    >
      {!chip.first && (
        <ChevronRight
          className={cn(
            'ig:absolute ig:top-1/2 ig:-left-[17px] ig:size-3.5 ig:-translate-y-1/2 ig:text-muted-foreground',
            reordering && 'ig:invisible'
          )}
        />
      )}
      <span
        className={cn(
          'ig:flex ig:h-6 ig:items-center ig:rounded-md ig:border ig:bg-background ig:pr-0.5 ig:font-medium ig:shadow-xs',
          isDragging && 'ig:opacity-40'
        )}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label={t('group-panel.move')}
          {...attributes}
          {...listeners}
          className="ig:flex ig:h-full ig:cursor-grab ig:touch-none ig:items-center ig:rounded-l-md ig:px-0.5 ig:text-muted-foreground ig:hover:text-foreground ig:focus-visible:ring-2 ig:focus-visible:ring-ring ig:focus-visible:outline-none ig:active:cursor-grabbing ig:[&_svg]:size-3.5"
        >
          <GripVertical />
        </button>
        <button
          type="button"
          disabled={!column.getCanSort()}
          onClick={(event) => column.getToggleSortingHandler()?.(event)}
          className="ig:flex ig:h-full ig:items-center ig:gap-1 ig:pr-1 ig:enabled:cursor-pointer ig:[&_svg]:size-3.5"
        >
          {columnLabel(column)}
          {chip.sorted && (
            <span className="ig:flex ig:items-center">
              {sortIcons[chip.sorted]}
              {chip.sortPosition > 0 && (
                <span className="ig:text-[10px] ig:leading-none ig:text-muted-foreground ig:tabular-nums">
                  {chip.sortPosition}
                </span>
              )}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label={t('group.remove')}
          onClick={() => column.toggleGroupBy()}
          className="ig:rounded-sm ig:p-0.5 ig:text-muted-foreground ig:hover:bg-muted-foreground/20 ig:hover:text-foreground"
        >
          <X className="ig:size-3" />
        </button>
      </span>
    </div>
  );
}

function PendingChip<TData extends object>({ column, first }: { column: GridColumn<TData>; first: boolean }) {
  return (
    <div className="ig:relative ig:flex ig:items-center">
      {!first && (
        <ChevronRight className="ig:absolute ig:top-1/2 ig:-left-[17px] ig:size-3.5 ig:-translate-y-1/2 ig:text-muted-foreground" />
      )}
      <span className="ig:flex ig:h-6 ig:items-center ig:gap-1 ig:rounded-md ig:border ig:border-dashed ig:border-primary/60 ig:bg-background/60 ig:px-2 ig:font-medium ig:text-muted-foreground">
        <Group className="ig:size-3.5 ig:text-primary" />
        {columnLabel(column)}
      </span>
    </div>
  );
}
