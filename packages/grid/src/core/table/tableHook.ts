import { createTableHook, type TableState } from '@tanstack/react-table';

import { formatAggregate, formatValue } from '#/core/columns/format.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import { features, type GridFeatures } from '#/core/table/features.ts';
import { quickFilter } from '#/core/table/quickFilter.ts';
import { tableContext } from '#/core/table/tableContext.ts';

function hasModifier(event: unknown, key: 'ctrlKey' | 'metaKey' | 'shiftKey'): boolean {
  return typeof event === 'object' && event !== null && Reflect.get(event, key) === true;
}

const tableHook = createTableHook({
  features,
  tableContext,
  globalFilterFn: quickFilter,
  getColumnCanGlobalFilter: () => true,
  columnResizeMode: 'onChange',
  autoResetExpanded: false,
  // In a tree a match keeps the nodes above it.
  filterFromLeafRows: true,
  isMultiSortEvent: (event) => hasModifier(event, 'ctrlKey') || hasModifier(event, 'metaKey'),
  isRowRangeSelectionEvent: (event) => hasModifier(event, 'shiftKey'),
  // Edits change `data`; the focused cell and the range must survive them.
  autoResetCellSelection: false,
  // Ranges are indexed in the order of the sorted rows, where pinned rows are not shown; they are focused only.
  enableCellSelection: (cell) => cell.row.getIsPinned() === false,
  defaultColumn: {
    ...gridDefaults.column,
    cell: ({ getValue, column }) => formatValue(getValue(), column),
    // `useBodyCell` gives the aggregation's mark separately, so a group row's cell is the aggregate's text.
    aggregatedCell: ({ column, getValue }) => formatAggregate(getValue(), column),
  },
});

/** Typed column definitions for `useGrid`, with the grid's column options and `meta`. */
export const createGridColumnHelper = tableHook.createAppColumnHelper;
export const { useAppTable } = tableHook;

// The table's owner renders only for its own state; grid components subscribe through `useGridSelector`.
export const selectNoState = (_state: TableState<GridFeatures>): null => null;

/** The table `useGrid` returns: a `CoreTable` with TanStack's React helpers, such as `AppTable`. */
export type GridInstance<TData extends object> = ReturnType<typeof useAppTable<TData, null>>;
export type GridTableOptions<TData extends object> = Parameters<typeof useAppTable<TData>>[0];
