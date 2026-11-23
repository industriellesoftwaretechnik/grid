import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface ExpandAllModel {
  /** Whether there is something to open or close: the rows are grouped, or a tree. */
  available: boolean;
  /** Opens every group or tree node, not the detail rows of master rows. */
  expandAll: () => void;
  collapseAll: () => void;
  labels: { expandAll: string; collapseAll: string };
}

/** Opens every group and tree node. Expanding with `true` instead would also open every detail. */
function expandParents<TData extends RowData>(table: CoreTable<TData>) {
  const parents = table.getPreExpandedRowModel().flatRows.filter((row) => row.subRows.length > 0);
  table.setExpanded(Object.fromEntries(parents.map((row) => [row.id, true])));
}

/** Opens and closes all groups or tree nodes at once. */
export function useExpandAll<TData extends RowData>(table: CoreTable<TData>): ExpandAllModel {
  const t = useTranslate(table);
  const available = useGridSelector(table, () => table.atoms.grouping.get().length > 0 || gridMeta(table).treeData);

  return {
    available,
    expandAll: () => expandParents(table),
    collapseAll: () => table.toggleAllRowsExpanded(false),
    labels: { expandAll: t('rows.expand-all'), collapseAll: t('rows.collapse-all') },
  };
}
