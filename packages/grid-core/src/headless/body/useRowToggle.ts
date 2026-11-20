import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/** The chevron that expands a group, a tree node or a master row. */
export function useRowToggle<TData extends RowData>(row: GridRow<TData>) {
  'use no memo';
  const expanded = useGridSelector(row.table.atoms.expanded, () => row.getIsExpanded());
  const { t } = gridMeta(row.table);

  return {
    /** Rows that cannot expand keep the toggle's space, so the content of a level lines up. */
    canExpand: row.getCanExpand(),
    expanded,
    label: expanded ? t('rows.collapse') : t('rows.expand'),
    /** The number of records in a group. */
    count: row.getLeafRows().length,
    /** Stops the event, so the row's own click handler does not see it. */
    toggle: (event?: { stopPropagation: () => void }) => {
      event?.stopPropagation();
      row.toggleExpanded();
    },
  };
}
