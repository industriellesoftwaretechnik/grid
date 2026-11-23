import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/types.ts';

/** Opens every group and tree node. Expanding with `true` instead would also open every detail. */
export function expandParents<TData extends RowData>(table: CoreTable<TData>) {
  const parents = table.getPreExpandedRowModel().flatRows.filter((row) => row.subRows.length > 0);
  table.setExpanded(Object.fromEntries(parents.map((row) => [row.id, true])));
}
