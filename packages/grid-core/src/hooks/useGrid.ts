import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import {
  functionalUpdate,
  makeStateUpdater,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type GroupingState,
  type SortingState,
  type TableState,
} from '@tanstack/react-table';

import { groupColumn, groupColumnId } from '#/columns/groupColumn.tsx';
import type { GridComponents } from '#/core/components.ts';
import type { GridExtraState, GroupDisplay } from '#/core/gridMeta.ts';
import { selectNoState, useAppTable, type GridTableOptions } from '#/core/tableHook.tsx';
import type { GridFeatures, GridRow, GridState } from '#/core/types.ts';
import { gridDefaults } from '#/defaults.ts';
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
import { updateOwnVisibility } from '#/logic/state/visibility.ts';
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

/** The options of a grid, apart from the components a UI layer supplies. */
export type GridOptions<TData extends object> = Omit<GridTableOptions<TData>, 'meta' | 'initialState' | 'data'> &
  RowSource<TData> & {
    /** Names the table; a persisted layout is stored under it. */
    id: string;
    /** The texts; keys left out stay English. A new object rebuilds the columns, so keep it stable. */
    messages?: Partial<GridMessages>;
    /** Keeps the layout across visits, in localStorage. `persistedSlices` lists what it keeps. */
    persist?: boolean;
    groupDisplay?: GroupDisplay;
    /** TanStack's initial state and the extra state. "Reset layout" returns to it. */
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

export type UseGridOptions<TData extends object> = GridOptions<TData> & {
  /** What the UI layer renders inside core's own columns. A UI package's hook passes its own. */
  components: GridComponents;
};

const noGrouping: GroupingState = [];

function splitState({ columnAggregation = {}, collapsedColumnGroups = {}, ...table }: Partial<GridState>): {
  table: Partial<TableState<GridFeatures>>;
  extra: GridExtraState;
} {
  return { table, extra: { columnAggregation, collapsedColumnGroups } };
}

export function useGrid<TData extends object>({
  id,
  components,
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
}: UseGridOptions<TData>) {
  const storageKey = persist ? `istec-grid:${id}` : undefined;
  const [initial] = useState(() =>
    splitState({ ...initialState, ...(storageKey === undefined ? {} : readPersistedState(storageKey)) })
  );
  const [extraState, setExtraState] = useState(initial.extra);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    () => initial.table.columnVisibility ?? {}
  );
  const [grouping, setGrouping] = useState<GroupingState>(() => initial.table.grouping ?? []);
  // The query slices are held here so the server rows can be requested before the table exists.
  const [sorting, setSorting] = useState<SortingState>(() => initial.table.sorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => initial.table.columnFilters ?? []);
  const [globalFilter, setGlobalFilter] = useState<unknown>(() => initial.table.globalFilter ?? '');

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
    const resolved = resolveColumns(options.columns, firstRow, isServer ? undefined : extraState.columnAggregation);
    return showGroupColumn ? insertAfterLockedColumns(resolved, groupColumn<TData>(groupLabel)) : resolved;
  }, [options.columns, firstRow, isServer, extraState.columnAggregation, showGroupColumn, groupLabel]);
  const forcedVisibility = useMemo<ColumnVisibilityState>(
    () => ({
      ...hiddenByColumnGroups(options.columns, extraState.collapsedColumnGroups, columnVisibility),
      ...(showGroupColumn && { [groupColumnId]: activeGrouping.length > 0 }),
    }),
    [options.columns, extraState.collapsedColumnGroups, columnVisibility, showGroupColumn, activeGrouping.length]
  );
  // A new object is a visibility change to every subscriber, so it is only rebuilt when an input changes.
  const tableVisibility = useMemo(
    () => ({ ...columnVisibility, ...forcedVisibility }),
    [columnVisibility, forcedVisibility]
  );

  const table = useAppTable(
    {
      ...options,
      data: rows,
      columns,
      initialState: initial.table,
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
      },
      onGroupingChange: setGrouping,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onColumnVisibilityChange: (updater) =>
        setColumnVisibility((own) => updateOwnVisibility(own, updater, forcedVisibility)),
      onRowSelectionChange: (updater) => {
        const next = withoutGroupRows(table, functionalUpdate(updater, table.atoms.rowSelection.get()));
        (options.onRowSelectionChange ?? makeStateUpdater('rowSelection', table))(next);
      },
      onCellValueChange: (change) => {
        if (isServer) serverRows.replaceRow(change.row.index, change.updatedRow);
        options.onCellValueChange?.(change);
      },
      meta: {
        tableId: id,
        t,
        components,
        groupDisplay,
        treeData,
        expandColumn:
          treeData || renderDetail !== undefined ? (expandColumn ?? firstDataColumnId(options.columns)) : undefined,
        renderDetail: renderDetail && ((rowId: string): ReactNode => renderDetail(table.getRow(rowId, true))),
        extraState,
        ownColumnVisibility: columnVisibility,
        server: serverRows.server,
        toggleRowGrouping: (columnId) => {
          const column = table.getColumn(columnId);
          if (!column) return;
          const wasGrouped = column.getIsGrouped();
          column.toggleGrouping();
          if (groupDisplay !== 'columns' && column.getCanHide()) {
            setColumnVisibility((own) => ({ ...own, [columnId]: wasGrouped }));
          }
        },
        setColumnAggregation: (columnId, aggregation) =>
          setExtraState((current) => ({
            ...current,
            columnAggregation: { ...current.columnAggregation, [columnId]: aggregation },
          })),
        toggleColumnGroup: (groupId) =>
          setExtraState((current) => ({
            ...current,
            collapsedColumnGroups: {
              ...current.collapsedColumnGroups,
              [groupId]: !current.collapsedColumnGroups[groupId],
            },
          })),
        setColumnsVisible: (columnIds, visible) =>
          setColumnVisibility((own) => ({
            ...own,
            ...Object.fromEntries(columnIds.map((columnId) => [columnId, visible])),
          })),
        resetLayout: () => {
          const defaults = splitState(initialState);
          table.setColumnOrder(defaults.table.columnOrder ?? []);
          table.setColumnSizing(defaults.table.columnSizing ?? {});
          table.setColumnPinning(defaults.table.columnPinning ?? { start: [], end: [] });
          setColumnVisibility(defaults.table.columnVisibility ?? {});
          setGrouping(defaults.table.grouping ?? []);
          table.resetExpanded();
          setExtraState(defaults.extra);
        },
      },
    },
    selectNoState
  );

  // After the render that read them, like the controlled state React's adapter publishes.
  useLayoutEffect(() => publishGridInputs(table));
  usePersistState(storageKey, table.gridStore);

  return table;
}
