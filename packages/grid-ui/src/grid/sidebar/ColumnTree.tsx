import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { GripVertical } from 'lucide-react';

import { Checkbox } from '#/internal/components/checkbox.tsx';
import {
  ColumnTree as HeadlessColumnTree,
  ColumnTreeLevel,
  useColumnTreeNode,
  type ColumnNode,
  type CoreTable,
} from '@istec/grid-core';

/** The columns as a tree, with a checkbox to show or hide each and a handle to reorder it. */
export function ColumnTree<TData extends RowData>({ table }: { table: CoreTable<TData> }) {
  return (
    <HeadlessColumnTree table={table}>
      {(nodes) => (
        <div className="max-h-80 overflow-y-auto">
          <ColumnNodes table={table} nodes={nodes} depth={0} />
        </div>
      )}
    </HeadlessColumnTree>
  );
}

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
    <ColumnTreeLevel nodes={nodes}>
      {(node) => <ColumnNodeItem key={node.column.id} table={table} node={node} depth={depth} />}
    </ColumnTreeLevel>
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
  const { label, isGroup, isDragging, nodeProps, handleProps, visibility, setVisible } = useColumnTreeNode(table, node);

  return (
    <div {...nodeProps} className={cn(isDragging && 'relative z-10 rounded-sm bg-popover opacity-80 shadow-sm')}>
      <div className="flex h-7 items-center gap-1 rounded-sm pr-2 hover:bg-muted" style={{ paddingLeft: depth * 16 }}>
        <button
          type="button"
          {...handleProps}
          className="flex h-full cursor-grab touch-none items-center rounded-sm px-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing [&_svg]:size-3.5"
        >
          <GripVertical />
        </button>
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
          <Checkbox
            checked={visibility.checked}
            indeterminate={visibility.indeterminate}
            disabled={visibility.disabled}
            onCheckedChange={setVisible}
          />
          <span className={cn('truncate', isGroup && 'font-medium')}>{label}</span>
        </label>
      </div>
      {isGroup && <ColumnNodes table={table} nodes={node.children} depth={depth + 1} />}
    </div>
  );
}
