import { useState, type ReactNode } from 'react';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  pointerWithin,
  type CollisionDetection,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { ArrowLeftRight, Ban, Group } from 'lucide-react';

import { groupPanelId, useColumnDragAndDrop } from '@/components/data-grid/use-column-drag-and-drop';
import { cn } from '@/lib/utils';
import { useColumnReorder, type CoreTable } from '@istec/grid';

type DropAction = 'move' | 'group' | 'reject';

// Over the group panel the pointer decides, so a drop there groups even when another header is closer.
// Column group headers are no drop targets: being wide, they would win near column boundaries.
function collisionDetectionFor(headerIds: ReadonlySet<UniqueIdentifier>): CollisionDetection {
  return (args) => {
    const panel = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => container.id === groupPanelId),
    });
    if (panel.length > 0) return panel;
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => headerIds.has(container.id)),
    });
  };
}

/** Wraps the header and the group panel, so a header dragged into the panel groups by its column. */
export function ColumnReorder<TData extends object>({
  table,
  children,
}: {
  table: CoreTable<TData>;
  children: ReactNode;
}) {
  const reorder = useColumnReorder(table);
  const [dragging, setDragging] = useState<string>();
  const [overPanel, setOverPanel] = useState(false);

  const dragAndDrop = useColumnDragAndDrop(({ active, over }) => {
    if (!over) return;
    if (over.id === groupPanelId) reorder.groupBy(String(active.id));
    else table.moveColumn(String(active.id), String(over.id));
  });
  const action: DropAction =
    !overPanel || dragging === undefined ? 'move' : reorder.canGroupBy(dragging) ? 'group' : 'reject';

  return (
    <DndContext
      {...dragAndDrop}
      onDragStart={(event) => {
        dragAndDrop.onDragStart();
        setDragging(String(event.active.id));
      }}
      onDragOver={(event) => setOverPanel(event.over?.id === groupPanelId)}
      onDragCancel={() => {
        dragAndDrop.onDragCancel();
        setDragging(undefined);
        setOverPanel(false);
      }}
      onDragEnd={(event) => {
        setDragging(undefined);
        setOverPanel(false);
        dragAndDrop.onDragEnd(event);
      }}
      collisionDetection={collisionDetectionFor(new Set(reorder.headerIds))}
    >
      <SortableContext items={reorder.headerIds} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {dragging !== undefined && (
          <div
            className={cn(
              'flex w-fit items-center gap-1.5 rounded-md border bg-popover px-2 py-1 text-xs font-medium shadow-md [&_svg]:size-3.5',
              action === 'reject' && 'border-destructive/50'
            )}
          >
            {action === 'move' && <ArrowLeftRight className="text-muted-foreground" />}
            {action === 'group' && <Group className="text-primary" />}
            {action === 'reject' && <Ban className="text-destructive" />}
            {reorder.label(dragging)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
