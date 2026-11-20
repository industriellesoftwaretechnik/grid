import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/** The column's filter value, re-rendering when it changes. */
export function useFilterValue<TData extends RowData>(column: GridColumn<TData>): unknown {
  return useGridSelector(
    column.table.atoms.columnFilters,
    (filters) => filters.find((filter) => filter.id === column.id)?.value
  );
}

/** Re-renders when any filter or the search changes, for what depends on the rows that pass them. */
export function useFilterState<TData extends RowData>(column: GridColumn<TData>): void {
  useGridSelector(column.table.store, (state) => [state.columnFilters, state.globalFilter]);
}
