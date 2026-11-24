import {
  assignTableAPIs,
  type ColumnFiltersState,
  type ExpandedState,
  type GroupingState,
  type RowData,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/react-table';

interface GridActionsTable {
  /** The number of column filters set, and 1 more while there is a search. */
  getActiveFilterCount: () => number;
  /** Removes every column filter and the search. */
  clearFilters: () => void;
  /** Whether there are parent rows to open and close: the rows are grouped, or a tree. */
  getCanExpandParentRows: () => boolean;
  /**
   * Opens every group and tree node, not the details of master rows; `toggleAllRowsExpanded(true)` would open those
   * too. `toggleAllRowsExpanded(false)` closes them all.
   */
  expandParentRows: () => void;
}

declare module '@tanstack/table-core' {
  interface Plugins {
    gridActionsFeature: TableFeature;
  }
  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    gridActionsFeature: GridActionsTable;
  }
}

// The feature's runtime view of the table; the public types come from the feature map.
interface ActionsTable {
  options: { meta?: { treeData?: boolean } };
  atoms: {
    columnFilters: { get: () => ColumnFiltersState };
    globalFilter: { get: () => unknown };
    grouping: { get: () => GroupingState };
  };
  resetColumnFilters: (defaultState?: boolean) => void;
  setGlobalFilter: (updater: Updater<unknown>) => void;
  setExpanded: (updater: Updater<ExpandedState>) => void;
  getPreExpandedRowModel: () => { flatRows: readonly { id: string; subRows: readonly unknown[] }[] };
}

function isActionsTable(table: unknown): table is ActionsTable {
  return typeof table === 'object' && table !== null && 'atoms' in table && 'setExpanded' in table;
}

function asActionsTable(table: unknown): ActionsTable {
  if (!isActionsTable(table)) throw new Error('gridActionsFeature needs a TanStack table with the grid features.');
  return table;
}

function activeFilterCount(table: ActionsTable): number {
  const search = table.atoms.globalFilter.get();
  return table.atoms.columnFilters.get().length + (search === undefined || search === '' ? 0 : 1);
}

function expandParentRows(table: ActionsTable) {
  const parents = table.getPreExpandedRowModel().flatRows.filter((row) => row.subRows.length > 0);
  table.setExpanded(Object.fromEntries(parents.map((row) => [row.id, true])));
}

/** The actions of the controls around a grid that TanStack lacks: clearing all filters and opening all groups. */
export const gridActionsFeature: TableFeature = {
  constructTableAPIs: (table) => {
    assignTableAPIs('gridActionsFeature', table, {
      table_getActiveFilterCount: { fn: () => activeFilterCount(asActionsTable(table)) },
      table_clearFilters: {
        fn: () => {
          const actions = asActionsTable(table);
          actions.resetColumnFilters(true);
          actions.setGlobalFilter('');
        },
      },
      table_getCanExpandParentRows: {
        fn: () => {
          const actions = asActionsTable(table);
          return actions.atoms.grouping.get().length > 0 || actions.options.meta?.treeData === true;
        },
      },
      table_expandParentRows: { fn: () => expandParentRows(asActionsTable(table)) },
    });
  },
};
