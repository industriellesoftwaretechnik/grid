import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable } from '#/core/types.ts';
import type { CheckState } from '#/headless/filters/setFilter.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import type { ColumnNode } from '#/logic/columns/columnOrder.ts';
/** A column or group in `ColumnTree`: its drag handle, and a checkbox that shows or hides its columns. */
export function useColumnTreeNode<TData extends RowData>(table: CoreTable<TData>, node: ColumnNode<TData>) {
  'use no memo';
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: node.column.id,
  });
  const meta = gridMeta(table);
  const toggleable = node.column
    .getLeafColumns()
    .filter((column) => column.getCanHide())
    .map((column) => column.id);
  const visible = toggleable.filter((columnId) => meta.ownColumnVisibility[columnId] !== false).length;

  return {
    label: columnLabel(node.column),
    isGroup: node.children.length > 0,
    isDragging,
    nodeProps: { ref: setNodeRef, style: { transform: CSS.Translate.toString(transform), transition } },
    handleProps: { ref: setActivatorNodeRef, 'aria-label': meta.t('columns.move'), ...attributes, ...listeners },
    visibility: {
      checked: toggleable.length > 0 && visible === toggleable.length,
      indeterminate: visible > 0 && visible < toggleable.length,
      disabled: toggleable.length === 0,
    } satisfies CheckState,
    setVisible: (next: boolean) => meta.setColumnsVisible(toggleable, next),
  };
}
