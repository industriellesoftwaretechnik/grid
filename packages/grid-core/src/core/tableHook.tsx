import { createTableHook, type TableState } from '@tanstack/react-table';

import { features, type GridFeatures } from '#/core/features.ts';
import { gridMeta } from '#/core/gridMeta.ts';
import { tableContext } from '#/core/tableContext.ts';
import { gridDefaults } from '#/defaults.ts';
import { quickFilter } from '#/logic/filters/quickFilter.ts';
import { formatValue } from '#/logic/format.ts';

function hasModifier(event: unknown, key: 'ctrlKey' | 'metaKey' | 'shiftKey'): boolean {
  return typeof event === 'object' && event !== null && Reflect.get(event, key) === true;
}

export const { createAppColumnHelper: createGridColumnHelper, useAppTable } = createTableHook({
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
    aggregatedCell: ({ table, column, getValue }) => {
      const { AggregatedCell } = gridMeta(table).components;
      return <AggregatedCell column={column} value={getValue()} />;
    },
  },
});

// The component holding the table selects no state, so it renders only for its own: each grid component subscribes
// to what it shows through `useGridSelector`.
export const selectNoState = (_state: TableState<GridFeatures>): null => null;

export type GridInstance<TData extends object> = ReturnType<typeof useAppTable<TData, null>>;
export type GridTableOptions<TData extends object> = Parameters<typeof useAppTable<TData>>[0];
