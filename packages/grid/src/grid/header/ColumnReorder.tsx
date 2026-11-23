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
import { cn } from 'cn';
import { ArrowLeftRight, Ban, Group } from 'lucide-react';

import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridColumn } from '#/core/types.ts';
import { useColumnDragAndDrop } from '#/hooks/useColumnDragAndDrop.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { columnOrderIds, moveColumns } from '#/logic/columns/columnOrder.ts';
import { canGroupBy, groupPanelId } from '#/logic/grouping/groupPanelIds.ts';

/** What dropping the dragged column does: move it, group by it, or nothing, for a column that cannot be grouped. */
type DropAction = 'move' | 'group' | 'reject';

// Over the group panel the pointer decides, so a header dragged up into it groups even when another header is
// closer; elsewhere the closest sortable header does. Column group headers register as droppables too, and being
// wide they would win near column boundaries, where the preview then jumps back and a drop does nothing.
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

/**
 * Reorders the header's columns by drag and drop, and groups by a column dropped into the group panel. It wraps the
 * header cells and the group panel. Pinned columns keep the order they were pinned in, so only the scrolling region is
 * sortable. The dragged column follows the pointer; like AG Grid's, its icon tells what a drop does.
 */
export function ColumnReorder<TData extends object>({
  table,
  children,
}: {
  table: GridInstance<TData>;
  children: ReactNode;
}) {
  const [dragging, setDragging] = useState<string>();
  const [overPanel, setOverPanel] = useState(false);
  const leafHeaders = useGridSelector(table, () => table.getCenterHeaderGroups().at(-1)?.headers ?? []);
  const columnOf = (id: string) => leafHeaders.find((header) => header.id === id)?.column;

  const dragAndDrop = useColumnDragAndDrop(({ active, over }) => {
    const from = columnOf(String(active.id));
    if (!from || !over) return;
    if (over.id === groupPanelId) {
      if (canGroupBy(from)) from.toggleGroupBy();
      return;
    }
    const to = columnOf(String(over.id));
    if (!to || from === to) return;
    table.setColumnOrder(moveColumns(columnOrderIds(table), [from.id], [to.id]));
  });
  const draggedColumn = dragging === undefined ? undefined : columnOf(dragging);
  const action: DropAction = !overPanel ? 'move' : draggedColumn && canGroupBy(draggedColumn) ? 'group' : 'reject';

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
      collisionDetection={collisionDetectionFor(new Set(leafHeaders.map((header) => header.id)))}
    >
      <SortableContext items={leafHeaders.map((header) => header.id)} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {draggedColumn && <DragPreview column={draggedColumn} action={action} />}
      </DragOverlay>
    </DndContext>
  );
}

function DragPreview<TData extends object>({ column, action }: { column: GridColumn<TData>; action: DropAction }) {
  return (
    <div
      className={cn(
        'ig:flex ig:w-fit ig:items-center ig:gap-1.5 ig:rounded-md ig:border ig:bg-popover ig:px-2 ig:py-1 ig:text-xs ig:font-medium ig:shadow-md ig:[&_svg]:size-3.5',
        action === 'reject' && 'ig:border-destructive/50'
      )}
    >
      {action === 'move' && <ArrowLeftRight className="ig:text-muted-foreground" />}
      {action === 'group' && <Group className="ig:text-primary" />}
      {action === 'reject' && <Ban className="ig:text-destructive" />}
      {columnLabel(column)}
    </div>
  );
}
