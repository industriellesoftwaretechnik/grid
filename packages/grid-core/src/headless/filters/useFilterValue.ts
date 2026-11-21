import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';

/** The column's filter value, re-rendering when it changes. */
export function useFilterValue<TData extends RowData>(column: GridColumn<TData>): unknown {
  return useGridSelector(column.table, () => column.getFilterValue());
}
