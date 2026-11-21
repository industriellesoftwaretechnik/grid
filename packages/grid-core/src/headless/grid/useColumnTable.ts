import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { columnLayout } from '#/logic/layout.ts';

/**
 * The widths of a `<table>` holding the visible columns: its own and each column's in display order, `'filler'` for
 * the column that takes the spare width. Header, body and footer are separate tables that share them.
 */
export function useColumnTable<TData extends RowData>(table: CoreTable<TData>) {
  return useGridSelector(table, () => ({
    width: table.getTotalSize(),
    columns: columnLayout(table).map((slot) =>
      slot === 'filler' ? ('filler' as const) : { id: slot.item.id, width: slot.item.getSize() }
    ),
  }));
}
