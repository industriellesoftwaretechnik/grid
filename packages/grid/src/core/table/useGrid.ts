import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import {
  functionalUpdate,
  makeStateUpdater,
  type ColumnVisibilityState,
  type GroupingState,
  type OnChangeFn,
} from '@tanstack/react-table';

import { firstDataColumnId, insertAfterLockedColumns, resolveColumns } from '#/core/columns/columnDefs.ts';
import { groupColumn, groupColumnId } from '#/core/columns/groupColumn.ts';
import type { ColumnAggregationState } from '#/core/plugins/columnAggregationFeature.ts';
import { publishGridInputs } from '#/core/plugins/gridStoreFeature.ts';
import { withoutGroupRows } from '#/core/selection/rowSelectionState.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import { readPersistedState } from '#/core/table/persistence.ts';
import { selectNoState, useAppTable, type GridTableOptions } from '#/core/table/tableHook.ts';
import type { CoreTable, GridRow, GridState } from '#/core/table/types.ts';
import { useControllableState } from '#/core/table/useControllableState.ts';
import { usePersistState } from '#/core/table/usePersistState.ts';

/** The options of a grid: TanStack's table options, and the grid's own. */
export type GridOptions<TData extends object> = Omit<
  GridTableOptions<TData>,
  'meta' | 'initialState' | 'defaultLayout'
> & {
  /** Names the table; a persisted layout is stored under it. */
  id: string;
  /**
   * The locale numbers and dates are shown in and values sorted by, as a BCP 47 tag such as `de-DE`; the browser's by
   * default. The grid has no texts of its own: its UI brings them.
   */
  locale?: string;
  /** Keeps the layout across visits, in localStorage. `persistedSlices` lists what it keeps. */
  persist?: boolean;
  /**
   * The state of the slices the host does not control, as `state` gives the others. "Reset layout" returns to its
   * layout, not to a persisted one.
   */
  initialState?: Partial<GridState>;
  /**
   * Makes rows master rows: expanding one shows this under it, across the table. `getRowCanExpand` limits it to
   * some rows; rows with children expand to those instead.
   */
  renderDetail?: (row: GridRow<TData>) => ReactNode;
  /**
   * The column whose cells hold the toggles of tree nodes and master rows. Defaults to the first data column. While the
   * group column is shown it holds them, and while this column is hidden the first shown data column does.
   */
  expandColumn?: string;
};

const noGrouping: GroupingState = [];

/**
 * The handler of a slice TanStack holds. Unless the host controls the slice, the table keeps holding it, and a host
 * that passes `onChange` only listens; TanStack alone would leave the slice to that host.
 */
function keepAndReport<TData extends object, K extends keyof GridState>(
  table: () => CoreTable<TData>,
  state: Partial<GridState> | undefined,
  slice: K,
  onChange: OnChangeFn<GridState[K]> | undefined
): OnChangeFn<GridState[K]> | undefined {
  if (state?.[slice] !== undefined) return onChange;
  return (updater) => {
    makeStateUpdater(slice, table())(updater);
    onChange?.(updater);
  };
}

/** Creates the grid's table: TanStack's, with the grid's features. Pass it to the hooks of each part. */
export function useGrid<TData extends object>({
  id,
  locale,
  persist = gridDefaults.persist,
  groupDisplay = gridDefaults.groupDisplay,
  initialState = {},
  renderDetail,
  expandColumn,
  ...options
}: GridOptions<TData>) {
  const storageKey = persist ? `istec-grid:${id}` : undefined;
  // The host's initial state with the persisted layout over it; "Reset layout" returns to the host's alone.
  const [startState] = useState((): Partial<GridState> => ({
    ...initialState,
    ...(storageKey === undefined ? {} : readPersistedState(storageKey)),
  }));
  // The slices the columns and their visibility are built from are held here, unless the host controls them.
  // TanStack holds the others.
  const [columnAggregation, setColumnAggregation] = useControllableState<ColumnAggregationState>(
    options.state?.columnAggregation,
    options.onColumnAggregationChange,
    () => startState.columnAggregation ?? {}
  );
  // The user's own choices; the table also hides the group column itself while nothing is grouped.
  const [columnVisibility, setColumnVisibility] = useControllableState<ColumnVisibilityState>(
    options.state?.columnVisibility,
    options.onColumnVisibilityChange,
    () => startState.columnVisibility ?? {}
  );
  const [grouping, setGrouping] = useControllableState<GroupingState>(
    options.state?.grouping,
    options.onGroupingChange,
    () => startState.grouping ?? []
  );

  const firstRow = options.data[0];
  // A tree is not grouped: grouping would regroup only its top-level rows.
  const treeData = options.getSubRows !== undefined;
  const showGroupColumn = groupDisplay === 'groupColumn' && !treeData;
  const { getRowCanExpand } = options;
  const activeGrouping = treeData ? noGrouping : grouping;
  const columns = useMemo(() => {
    const resolved = resolveColumns(options.columns, firstRow, columnAggregation);
    return showGroupColumn ? insertAfterLockedColumns(resolved, groupColumn<TData>()) : resolved;
  }, [options.columns, firstRow, columnAggregation, showGroupColumn]);
  // The group column shows only while something is grouped. A new object is a visibility change to every subscriber,
  // so it is only rebuilt when an input changes.
  const grouped = activeGrouping.length > 0;
  const tableVisibility = useMemo<ColumnVisibilityState>(
    () => (showGroupColumn ? { ...columnVisibility, [groupColumnId]: grouped } : columnVisibility),
    [columnVisibility, showGroupColumn, grouped]
  );

  // Handlers run after the table exists; the explicit type breaks the cycle of `table`'s inferred type.
  const tableOf = (): CoreTable<TData> => table;
  const keep = <K extends keyof GridState>(slice: K, onChange: OnChangeFn<GridState[K]> | undefined) =>
    keepAndReport(tableOf, options.state, slice, onChange);
  const table = useAppTable(
    {
      ...options,
      columns,
      initialState: startState,
      groupDisplay,
      defaultLayout: initialState,
      // Only in `columns` mode do the grouped columns hold the group toggles and move to the front.
      groupedColumnMode: groupDisplay === 'columns' ? 'reorder' : false,
      enableGrouping: treeData ? false : options.enableGrouping,
      getRowCanExpand:
        renderDetail === undefined
          ? getRowCanExpand
          : (row) => row.subRows.length > 0 || (getRowCanExpand?.(row) ?? true),
      state: {
        ...options.state,
        grouping: activeGrouping,
        columnVisibility: tableVisibility,
        columnAggregation,
      },
      onColumnAggregationChange: setColumnAggregation,
      onGroupingChange: setGrouping,
      // TanStack's updaters see the user's own choices, so the columns the table hides itself stay out of them.
      onColumnVisibilityChange: setColumnVisibility,
      onSortingChange: keep('sorting', options.onSortingChange),
      onColumnFiltersChange: keep('columnFilters', options.onColumnFiltersChange),
      onGlobalFilterChange: keep('globalFilter', options.onGlobalFilterChange),
      onColumnOrderChange: keep('columnOrder', options.onColumnOrderChange),
      onColumnSizingChange: keep('columnSizing', options.onColumnSizingChange),
      onColumnResizingChange: keep('columnResizing', options.onColumnResizingChange),
      onColumnPinningChange: keep('columnPinning', options.onColumnPinningChange),
      onExpandedChange: keep('expanded', options.onExpandedChange),
      onRowPinningChange: keep('rowPinning', options.onRowPinningChange),
      onCellSelectionChange: keep('cellSelection', options.onCellSelectionChange),
      onEditingCellChange: keep('editingCell', options.onEditingCellChange),
      onRowSelectionChange: (updater) => {
        const next = withoutGroupRows(table, functionalUpdate(updater, table.atoms.rowSelection.get()));
        (keep('rowSelection', options.onRowSelectionChange) ?? makeStateUpdater('rowSelection', table))(next);
      },
      meta: {
        tableId: id,
        locale,
        treeData,
        expandColumn:
          treeData || renderDetail !== undefined ? (expandColumn ?? firstDataColumnId(options.columns)) : undefined,
        renderDetail: renderDetail && ((rowId: string): ReactNode => renderDetail(table.getRow(rowId, true))),
        ownColumnVisibility: columnVisibility,
      },
    },
    selectNoState
  );

  // After the render that read them, like the controlled state React's adapter publishes.
  useLayoutEffect(() => publishGridInputs(table));
  usePersistState(storageKey, table.gridStore);

  return table;
}
