import type { ReactNode } from 'react';

import { closestCenter, DndContext, type CollisionDetection } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useColumnDragAndDrop } from '#/hooks/useColumnDragAndDrop.ts';
import { columnOrderIds, columnTree, moveColumns, type ColumnNode } from '#/logic/columns/columnOrder.ts';

export type { ColumnNode };

/**
 * The columns as a tree of groups and columns in display order, dragged up and down to reorder them. An item moves
 * among its siblings only, so a column stays in its group and a group moves as a whole. `children` renders the top
 * level, usually through `ColumnTreeLevel`.
 */
export function ColumnTree<TData extends RowData>({
  table,
  children,
}: {
  table: CoreTable<TData>;
  children: (nodes: ColumnNode<TData>[]) => ReactNode;
}) {
  const tree = useGridSelector(table, () => columnTree(table));
  const nodes = new Map<string, ColumnNode<TData>>();
  const parents = new Map<string, string | undefined>();
  const index = (siblings: ColumnNode<TData>[], parent?: string) => {
    for (const node of siblings) {
      nodes.set(node.column.id, node);
      parents.set(node.column.id, parent);
      index(node.children, node.column.id);
    }
  };
  index(tree);

  const collisionDetection: CollisionDetection = (args) =>
    closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => parents.get(String(container.id)) === parents.get(String(args.active.id))
      ),
    });
  const dragAndDrop = useColumnDragAndDrop(({ active, over }) => {
    const moving = nodes.get(String(active.id));
    const target = over ? nodes.get(String(over.id)) : undefined;
    if (!moving || !target || moving === target) return;
    table.setColumnOrder(moveColumns(columnOrderIds(table), moving.leafIds, target.leafIds));
  });

  return (
    <DndContext {...dragAndDrop} collisionDetection={collisionDetection} modifiers={[restrictToVerticalAxis]}>
      {children(tree)}
    </DndContext>
  );
}

/** One level of `ColumnTree`: siblings that reorder among themselves. `children` returns a component per node. */
export function ColumnTreeLevel<TData extends RowData>({
  nodes,
  children,
}: {
  nodes: ColumnNode<TData>[];
  children: (node: ColumnNode<TData>) => ReactNode;
}) {
  return (
    <SortableContext items={nodes.map((node) => node.column.id)} strategy={verticalListSortingStrategy}>
      {nodes.map(children)}
    </SortableContext>
  );
}
