import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import {
  functionalUpdate,
  makeStateUpdater,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type GroupingState,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table';

import { groupColumn, groupColumnId } from '#/columns/groupColumn.tsx';
import { selectNoState, useAppTable, type GridTableOptions } from '#/core/tableHook.tsx';
import type { CoreTable, GridRow, GridState } from '#/core/types.ts';
import { gridDefaults } from '#/defaults.ts';
import { useControllableState } from '#/hooks/useControllableState.ts';
import { usePersistState } from '#/hooks/usePersistState.ts';
import { useServerRows } from '#/hooks/useServerRows.ts';
import { createTranslate, type GridMessages } from '#/locale/messages.ts';
import {
  firstDataColumnId,
  hiddenByColumnGroups,
  insertAfterLockedColumns,
  resolveColumns,
} from '#/logic/columns/columnDefs.ts';
import { columnMeta } from '#/logic/columns/columnInfo.ts';
import type { FilterKind } from '#/logic/columns/columnMeta.ts';
import { withoutGroupRows } from '#/logic/selection/rowSelectionState.ts';
import { serverFilters, type FetchRows, type ServerFilter } from '#/logic/server/serverRequest.ts';
import { readPersistedState } from '#/logic/state/persistence.ts';
import type { ColumnAggregationState } from '#/plugins/columnAggregationFeature.ts';
import type { CollapsedColumnGroupsState } from '#/plugins/columnGroupCollapseFeature.ts';
import { publishGridInputs } from '#/plugins/gridStoreFeature.ts';

/** The rows come either all at once in `data`, or block by block from the server through `fetchRows`. */
type RowSource<TData> =
  | { data: TData[]; fetchRows?: never; blockSize?: never }
  | {
      data?: never;
      /**
       * Loads a block of rows, sorted and filtered on the server; further blocks load while scrolling. A new function
       * reloads, so wrap it in `useCallback` with what it depends on. Grouping and aggregation are off, and
       * `getRowId` should be set so selection survives reloads.
       */
      fetchRows: FetchRows<TData>;
      /** Rows per request. */
      blockSize?: number;
    };

/** The options of a grid. */
export type GridOptions<TData extends object> = Omit<
  GridTableOptions<TData>,
  'meta' | 'initialState' | 'data' | 'defaultLayout'
> &
  RowSource<TData> & {
    /** Names the table; a persisted layout is stored under it. */
    id: string;
    /** The texts; keys left out stay English. A new object rebuilds the columns, so keep it stable. */
    messages?: Partial<GridMessages>;
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

export function useGrid<TData extends object>({
  id,
  messages,
  persist = gridDefaults.persist,
  groupDisplay = gridDefaults.groupDisplay,
  initialState = {},
  data,
  fetchRows,
  blockSize = gridDefaults.blockSize,
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
  // The slices the table's options are built from are held here, unless the host controls them; the server rows
  // need the query slices before the table exists. TanStack holds the others.
  const [collapsedColumnGroups, setCollapsedColumnGroups] = useControllableState<CollapsedColumnGroupsState>(
    options.state?.collapsedColumnGroups,
    options.onCollapsedColumnGroupsChange,
    () => startState.collapsedColumnGroups ?? {}
  );
  const [columnAggregation, setColumnAggregation] = useControllableState<ColumnAggregationState>(
    options.state?.columnAggregation,
    options.onColumnAggregationChange,
    () => startState.columnAggregation ?? {}
  );
  // The user's own choices; the table also hides columns itself (`forcedVisibility`).
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
  const [sorting, setSorting] = useControllableState<SortingState>(
    options.state?.sorting,
    options.onSortingChange,
    () => startState.sorting ?? []
  );
  const [columnFilters, setColumnFilters] = useControllableState<ColumnFiltersState>(
    options.state?.columnFilters,
    options.onColumnFiltersChange,
    () => startState.columnFilters ?? []
  );
  const [globalFilter, setGlobalFilter] = useControllableState<unknown>(
    options.state?.globalFilter,
    options.onGlobalFilterChange,
    () => startState.globalFilter ?? ''
  );

  const isServer = fetchRows !== undefined;
  const serverRows = useServerRows({
    fetchRows,
    blockSize,
    sorting,
    columnFilters,
    globalFilter,
    toServerFilters: (filters): ServerFilter[] =>
      serverFilters(filters, (columnId): FilterKind | false | undefined => {
        const column = table.getColumn(columnId);
        return column && columnMeta(column).filter;
      }),
  });
  const rows = data ?? serverRows.rows;

  const t = useMemo(() => createTranslate(messages), [messages]);
  const groupLabel = t('group');
  const firstRow = rows[0];
  // A tree is not grouped: grouping would regroup only its top-level rows. Server rows are not grouped yet.
  const treeData = options.getSubRows !== undefined;
  const canGroup = !treeData && !isServer;
  const showGroupColumn = groupDisplay === 'groupColumn' && canGroup;
  const { getRowCanExpand } = options;
  const activeGrouping = canGroup ? grouping : noGrouping;
  const columns = useMemo(() => {
    const resolved = resolveColumns(options.columns, firstRow, isServer ? undefined : columnAggregation);
    return showGroupColumn ? insertAfterLockedColumns(resolved, groupColumn<TData>(groupLabel)) : resolved;
  }, [options.columns, firstRow, isServer, columnAggregation, showGroupColumn, groupLabel]);
  const forcedVisibility = useMemo<ColumnVisibilityState>(
    () => ({
      ...hiddenByColumnGroups(options.columns, collapsedColumnGroups, columnVisibility),
      ...(showGroupColumn && { [groupColumnId]: activeGrouping.length > 0 }),
    }),
    [options.columns, collapsedColumnGroups, columnVisibility, showGroupColumn, activeGrouping.length]
  );
  // A new object is a visibility change to every subscriber, so it is only rebuilt when an input changes.
  const tableVisibility = useMemo(
    () => ({ ...columnVisibility, ...forcedVisibility }),
    [columnVisibility, forcedVisibility]
  );

  // Handlers run after the table exists; the explicit type breaks the cycle of `table`'s inferred type.
  const tableOf = (): CoreTable<TData> => table;
  const table = useAppTable(
    {
      ...options,
      data: rows,
      columns,
      initialState: startState,
      groupDisplay,
      defaultLayout: initialState,
      // Only in `columns` mode do the grouped columns hold the group toggles and move to the front.
      groupedColumnMode: groupDisplay === 'columns' ? 'reorder' : false,
      ...(isServer && { manualSorting: true, manualFiltering: true }),
      enableGrouping: canGroup ? options.enableGrouping : false,
      getRowCanExpand:
        renderDetail === undefined
          ? getRowCanExpand
          : (row) => row.subRows.length > 0 || (getRowCanExpand?.(row) ?? true),
      state: {
        ...options.state,
        grouping: activeGrouping,
        columnVisibility: tableVisibility,
        sorting,
        columnFilters,
        globalFilter,
        columnAggregation,
        collapsedColumnGroups,
      },
      onColumnAggregationChange: setColumnAggregation,
      onCollapsedColumnGroupsChange: setCollapsedColumnGroups,
      onGroupingChange: setGrouping,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      // TanStack's updaters see the user's own choices, so the columns the table hides itself stay out of them.
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: keepAndReport(tableOf, options.state, 'columnOrder', options.onColumnOrderChange),
      onColumnSizingChange: keepAndReport(tableOf, options.state, 'columnSizing', options.onColumnSizingChange),
      onColumnResizingChange: keepAndReport(tableOf, options.state, 'columnResizing', options.onColumnResizingChange),
      onColumnPinningChange: keepAndReport(tableOf, options.state, 'columnPinning', options.onColumnPinningChange),
      onExpandedChange: keepAndReport(tableOf, options.state, 'expanded', options.onExpandedChange),
      onRowPinningChange: keepAndReport(tableOf, options.state, 'rowPinning', options.onRowPinningChange),
      onCellSelectionChange: keepAndReport(tableOf, options.state, 'cellSelection', options.onCellSelectionChange),
      onEditingCellChange: keepAndReport(tableOf, options.state, 'editingCell', options.onEditingCellChange),
      onRowSelectionChange: (updater) => {
        const next = withoutGroupRows(table, functionalUpdate(updater, table.atoms.rowSelection.get()));
        (
          keepAndReport(tableOf, options.state, 'rowSelection', options.onRowSelectionChange) ??
          makeStateUpdater('rowSelection', table)
        )(next);
      },
      onCellValueChange: (change) => {
        if (isServer) serverRows.replaceRow(change.row.index, change.updatedRow);
        options.onCellValueChange?.(change);
      },
      meta: {
        tableId: id,
        t,
        treeData,
        expandColumn:
          treeData || renderDetail !== undefined ? (expandColumn ?? firstDataColumnId(options.columns)) : undefined,
        renderDetail: renderDetail && ((rowId: string): ReactNode => renderDetail(table.getRow(rowId, true))),
        ownColumnVisibility: columnVisibility,
        server: serverRows.server,
      },
    },
    selectNoState
  );

  // After the render that read them, like the controlled state React's adapter publishes.
  useLayoutEffect(() => publishGridInputs(table));
  usePersistState(storageKey, table.gridStore);

  return table;
}
