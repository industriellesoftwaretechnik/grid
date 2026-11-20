import { createContext, use } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GroupChip } from '#/headless/grouping/GroupChipList.tsx';
import { columnLabel } from '#/logic/columns/columnInfo.ts';

/** Whether the levels of `GroupChipList` are being reordered. */
export const ReorderingContext = createContext(false);
/** A chip of `GroupChipList`: dragged by its handle, clicked to sort, and removed to ungroup. */
export function useGroupChip<TData extends object>({ column }: GroupChip<TData>) {
  'use no memo';
  const reordering = use(ReorderingContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });
  const meta = gridMeta(column.table);

  return {
    label: columnLabel(column),
    isDragging,
    /** While the levels are reordered, arrows between chips would point between the wrong ones, so they hide. */
    reordering,
    nodeProps: { ref: setNodeRef, style: { transform: CSS.Translate.toString(transform), transition } },
    handleProps: { ref: setActivatorNodeRef, 'aria-label': meta.t('group-panel.move'), ...attributes, ...listeners },
    canSort: column.getCanSort(),
    toggleSorting: column.getToggleSortingHandler(),
    remove: { label: meta.t('group.remove'), onClick: () => meta.toggleRowGrouping(column.id) },
  };
}
