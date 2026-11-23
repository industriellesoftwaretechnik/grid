import { createContext, use, useState } from 'react';

import { closestCenter, DndContext, DragOverlay, useDndContext, useDroppable } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, GripVertical, Group, X } from 'lucide-react';

import { SortIndicator } from '@/components/data-grid/header';
import { barClassName } from '@/components/data-grid/styles';
import { ExpandCollapseButtons } from '@/components/data-grid/toolbar';
import { groupPanelId, useColumnDragAndDrop } from '@/components/data-grid/use-column-drag-and-drop';
import { cn } from '@/lib/utils';
import { useColumnReorder, useGroupPanel, type CoreTable, type GroupChip, type GroupPanelModel } from '@istec/grid';

/**
 * The row above the header that shows the grouping. Header columns are dragged into it to group by them, so it sits
 * inside `ColumnReorder`.
 */
export function GroupPanel<TData extends object>({ table }: { table: CoreTable<TData> }) {
  const panel = useGroupPanel(table);
  const reorder = useColumnReorder(table);
  const { setNodeRef, isOver } = useDroppable({ id: groupPanelId });
  const { active } = useDndContext();
  const dragged = active !== null && reorder.headerIds.includes(String(active.id)) ? String(active.id) : undefined;
  const accepts = dragged !== undefined && reorder.canGroupBy(dragged);
  const pending = isOver && accepts && dragged !== undefined ? reorder.label(dragged) : undefined;

  return (
    <div
      ref={setNodeRef}
      role="toolbar"
      aria-label={panel.labels.panel}
      className={cn(
        barClassName,
        'gap-1 border-b transition-colors select-none',
        isOver && accepts && 'bg-accent',
        isOver && dragged !== undefined && !accepts && 'bg-destructive/10'
      )}
    >
      <Group className="size-3.5 shrink-0 text-muted-foreground" />
      {!panel.grouped && pending === undefined ? (
        <span className="px-1 text-muted-foreground">{panel.labels.placeholder}</span>
      ) : (
        <GroupChips panel={panel} pending={pending} />
      )}
      <ExpandCollapseButtons table={table} size="sm" className="ml-auto" />
    </div>
  );
}

/** While the levels are reordered, arrows between chips would point between the wrong ones, so they hide. */
const ReorderingContext = createContext(false);

/**
 * The grouped columns as chips in their level order, dragged sideways to reorder the levels; they have their own drag
 * and drop, apart from the header's. `pending` is a column dragged over the panel, shown as the level it would add.
 */
function GroupChips<TData extends object>({ panel, pending }: { panel: GroupPanelModel<TData>; pending?: string }) {
  const [dragging, setDragging] = useState<string>();
  // The grouping reaches the panel a render after the drop, while dnd-kit drops its transforms at once; until then
  // the chips keep the dropped order, or they would show the old one for a frame and slide back.
  const [dropped, setDropped] = useState<{ order: string[]; over: string }>();
  const grouping = panel.chips.map((chip) => chip.column.id);
  const groupingKey = grouping.join('\n');
  if (dropped && dropped.over !== groupingKey) setDropped(undefined);
  const ids = dropped?.order ?? grouping;
  const chips = ids.flatMap((id) => panel.chips.filter((chip) => chip.column.id === id));
  const dragAndDrop = useColumnDragAndDrop(({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    setDropped({ order: ids.toSpliced(from, 1).toSpliced(to, 0, String(active.id)), over: groupingKey });
    panel.moveLevel(from, to);
  });
  const draggedChip = chips.find((chip) => chip.column.id === dragging);

  return (
    <div className="flex items-center gap-5 pl-1">
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
          <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
            {chips.map((chip, index) => (
              <SortableChip key={chip.column.id} chip={chip} first={index === 0} panel={panel} />
            ))}
            {pending !== undefined && (
              <div className="relative flex items-center">
                {panel.grouped && <LevelArrow />}
                <span className="flex h-6 items-center gap-1 rounded-md border border-dashed border-primary/60 bg-background/60 px-2 font-medium text-muted-foreground">
                  <Group className="size-3.5 text-primary" />
                  {pending}
                </span>
              </div>
            )}
          </SortableContext>
        </ReorderingContext>
        <DragOverlay dropAnimation={null}>
          {draggedChip && (
            <span className="flex h-6 w-fit items-center gap-1 rounded-md border bg-background px-2 font-medium shadow-md">
              <GripVertical className="size-3.5 text-muted-foreground" />
              {draggedChip.label}
            </span>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// The arrow before a chip sits in the gap, outside the chip's width, so the widths the drag measured stay true.
function LevelArrow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ChevronRight
      className={cn(
        'absolute top-1/2 -left-[17px] size-3.5 -translate-y-1/2 text-muted-foreground',
        hidden && 'invisible'
      )}
    />
  );
}

function SortableChip<TData extends object>({
  chip,
  first,
  panel,
}: {
  chip: GroupChip<TData>;
  first: boolean;
  panel: GroupPanelModel<TData>;
}) {
  const reordering = use(ReorderingContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: chip.column.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="relative flex items-center"
    >
      {!first && <LevelArrow hidden={reordering} />}
      <span
        className={cn(
          'flex h-6 items-center rounded-md border bg-background pr-0.5 font-medium shadow-xs',
          isDragging && 'opacity-40'
        )}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label={panel.labels.move}
          {...attributes}
          {...listeners}
          className="flex h-full cursor-grab touch-none items-center rounded-l-md px-0.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing [&_svg]:size-3.5"
        >
          <GripVertical />
        </button>
        <button
          type="button"
          disabled={!chip.canSort}
          onClick={chip.toggleSorting}
          className="flex h-full items-center gap-1 pr-1 enabled:cursor-pointer [&_svg]:size-3.5"
        >
          {chip.label}
          <SortIndicator sorted={chip.sorted} position={chip.sortPosition} />
        </button>
        <button
          type="button"
          aria-label={panel.labels.remove}
          onClick={chip.remove}
          className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </span>
    </div>
  );
}
