import type { RowData } from '@tanstack/react-table';

import type { GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useTranslate } from '#/headless/useTranslate.ts';

/** The chevron that expands a group, a tree node or a master row. */
export function useRowToggle<TData extends RowData>(row: GridRow<TData>) {
  const t = useTranslate(row.table);
  const { canExpand, expanded } = useGridSelector(row.table, () => ({
    canExpand: row.getCanExpand(),
    expanded: row.getIsExpanded(),
  }));

  return {
    /** Rows that cannot expand keep the toggle's space, so the content of a level lines up. */
    canExpand,
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
