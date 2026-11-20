import { useDndContext, useDroppable } from '@dnd-kit/core';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridInstance } from '#/core/tableHook.tsx';
import { expandParents } from '#/logic/expanding/expandParents.ts';
import { canGroupBy, groupPanelId } from '#/logic/grouping/groupPanelIds.ts';

/**
 * The row above the header that shows the grouping; header columns are dragged into it to group by them. It must sit
 * inside `ColumnReorder`. `pending` is a column dragged over it that it would group by; `rejecting` is set while one
 * that cannot be grouped is over it.
 */
export function useGroupPanel<TData extends object>(table: GridInstance<TData>) {
  'use no memo';
  const { setNodeRef, isOver } = useDroppable({ id: groupPanelId });
  const { active } = useDndContext();
  const { t } = gridMeta(table);
  const { grouping } = table.state;
  const draggedColumn =
    active === null
      ? undefined
      : table
          .getCenterHeaderGroups()
          .at(-1)
          ?.headers.find((header) => header.id === active.id)?.column;
  const accepts = draggedColumn !== undefined && canGroupBy(draggedColumn);

  return {
    /** For the panel's element, which columns are dropped on. */
    panelProps: { ref: setNodeRef },
    accepting: isOver && accepts,
    rejecting: isOver && draggedColumn !== undefined && !accepts,
    pending: isOver && accepts ? draggedColumn : undefined,
    grouped: grouping.length > 0,
    label: t('group-panel.label'),
    placeholder: t('group-panel.placeholder'),
    expandAll: { label: t('rows.expand-all'), onClick: () => expandParents(table) },
    collapseAll: { label: t('rows.collapse-all'), onClick: () => table.toggleAllRowsExpanded(false) },
  };
}
