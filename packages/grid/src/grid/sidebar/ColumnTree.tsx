import { closestCenter, DndContext, type CollisionDetection } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { GripVertical } from 'lucide-react';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable } from '#/core/types.ts';
import { useColumnDragAndDrop } from '#/hooks/useColumnDragAndDrop.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { Checkbox } from '#/internal/components/checkbox.tsx';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { columnOrderIds, columnTree, moveColumns, type ColumnNode } from '#/logic/columns/columnOrder.ts';
import { setColumnsVisible } from '#/logic/state/visibility.ts';

/**
 * The columns as a tree of groups and columns in display order, with a checkbox to show or hide each and a handle to
 * drag it up and down. An item moves among its siblings only, so a column stays in its group and a group moves as a
 * whole.
 */
export function ColumnTree<TData extends RowData>({ table }: { table: CoreTable<TData> }) {
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
      <div className="ig:max-h-80 ig:overflow-y-auto">
        <ColumnNodes table={table} nodes={tree} depth={0} />
      </div>
    </DndContext>
  );
}

// Siblings, which reorder among themselves.
function ColumnNodes<TData extends RowData>({
  table,
  nodes,
  depth,
}: {
  table: CoreTable<TData>;
  nodes: ColumnNode<TData>[];
  depth: number;
}) {
  return (
    <SortableContext items={nodes.map((node) => node.column.id)} strategy={verticalListSortingStrategy}>
      {nodes.map((node) => (
        <ColumnNodeItem key={node.column.id} table={table} node={node} depth={depth} />
      ))}
    </SortableContext>
  );
}

function ColumnNodeItem<TData extends RowData>({
  table,
  node,
  depth,
}: {
  table: CoreTable<TData>;
  node: ColumnNode<TData>;
  depth: number;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: node.column.id,
  });
  const t = useTranslate(table);
  const { toggleable, visible } = useGridSelector(table, () => {
    const ids = node.column
      .getLeafColumns()
      .filter((column) => column.getCanHide())
      .map((column) => column.id);
    const own = gridMeta(table).ownColumnVisibility;
    return { toggleable: ids, visible: ids.filter((columnId) => own[columnId] !== false).length };
  });
  const isGroup = node.children.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && 'ig:relative ig:z-10 ig:rounded-sm ig:bg-popover ig:opacity-80 ig:shadow-sm')}
    >
      <div
        className="ig:flex ig:h-7 ig:items-center ig:gap-1 ig:rounded-sm ig:pr-2 ig:hover:bg-muted"
        style={{ paddingLeft: depth * 16 }}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label={t('columns.move')}
          {...attributes}
          {...listeners}
          className="ig:flex ig:h-full ig:cursor-grab ig:touch-none ig:items-center ig:rounded-sm ig:px-0.5 ig:text-muted-foreground ig:hover:text-foreground ig:active:cursor-grabbing ig:[&_svg]:size-3.5"
        >
          <GripVertical />
        </button>
        <label className="ig:flex ig:min-w-0 ig:flex-1 ig:cursor-pointer ig:items-center ig:gap-2">
          <Checkbox
            checked={toggleable.length > 0 && visible === toggleable.length}
            indeterminate={visible > 0 && visible < toggleable.length}
            disabled={toggleable.length === 0}
            onCheckedChange={(next) => setColumnsVisible(table, toggleable, next)}
          />
          <span className={cn('ig:truncate', isGroup && 'ig:font-medium')}>{columnLabel(node.column)}</span>
        </label>
      </div>
      {isGroup && <ColumnNodes table={table} nodes={node.children} depth={depth + 1} />}
    </div>
  );
}
