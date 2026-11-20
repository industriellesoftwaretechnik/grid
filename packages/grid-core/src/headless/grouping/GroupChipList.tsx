import { useState, type ReactNode } from 'react';

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import type { SortDirection } from '@tanstack/react-table';

import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridColumn } from '#/core/types.ts';
import { ReorderingContext } from '#/headless/grouping/useGroupChip.ts';
import { useColumnDragAndDrop } from '#/hooks/useColumnDragAndDrop.ts';

export interface GroupChip<TData extends object> {
  column: GridColumn<TData>;
  /** The first level, which has no arrow before it. */
  first: boolean;
  sorted: false | SortDirection;
  /** The column's place in a multi-sort, from 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
}

/**
 * The grouped columns as chips in their level order, dragged sideways to reorder the levels. The chips have their own
 * drag and drop, apart from the header's. `pending` is a column dragged over the group panel, shown as the level it
 * would add. `renderChip` returns a component that calls `useGroupChip`.
 */
export function GroupChipList<TData extends object>({
  table,
  pending,
  renderChip,
  renderPending,
  renderOverlay,
}: {
  table: GridInstance<TData>;
  pending: GridColumn<TData> | undefined;
  renderChip: (chip: GroupChip<TData>) => ReactNode;
  renderPending: (column: GridColumn<TData>, first: boolean) => ReactNode;
  renderOverlay: (column: GridColumn<TData>) => ReactNode;
}) {
  const { grouping, sorting } = table.state;
  const [dragging, setDragging] = useState<string>();
  const dragAndDrop = useColumnDragAndDrop(({ active, over }) => {
    const from = grouping.indexOf(String(active.id));
    const to = over ? grouping.indexOf(String(over.id)) : -1;
    if (from !== -1 && to !== -1 && from !== to) table.setGrouping(arrayMove(grouping, from, to));
  });
  const draggedColumn = dragging === undefined ? undefined : table.getColumn(dragging);

  return (
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
          {grouping.map((columnId, index) => {
            const column = table.getColumn(columnId);
            if (!column) return null;
            const sortIndex = sorting.findIndex((sort) => sort.id === columnId);
            const sort = sorting[sortIndex];
            return renderChip({
              column,
              first: index === 0,
              sorted: sort ? (sort.desc ? 'desc' : 'asc') : false,
              sortPosition: sorting.length > 1 ? sortIndex + 1 : 0,
            });
          })}
          {pending && renderPending(pending, grouping.length === 0)}
        </SortableContext>
      </ReorderingContext>
      <DragOverlay dropAnimation={null}>{draggedColumn && renderOverlay(draggedColumn)}</DragOverlay>
    </DndContext>
  );
}
