import {
  assignPrototypeAPIs,
  assignTableAPIs,
  makeStateUpdater,
  setStateSlice,
  type OnChangeFn,
  type RowData,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/table-core';

/** Collapsed column groups by group id. */
export type CollapsedColumnGroupsState = Record<string, boolean>;

interface ColumnGroupCollapseOptions {
  onCollapsedColumnGroupsChange?: OnChangeFn<CollapsedColumnGroupsState>;
}

interface ColumnGroupCollapseTable {
  setCollapsedColumnGroups: (updater: Updater<CollapsedColumnGroupsState>) => void;
}

interface ColumnGroupCollapseColumn {
  /** Whether the column group is collapsed: it shows its `groupShow: 'closed'` columns instead of its `'open'` ones. */
  getIsCollapsed: () => boolean;
  toggleCollapsed: () => void;
}

declare module '@tanstack/table-core' {
  interface Plugins {
    columnGroupCollapseFeature: TableFeature;
  }
  interface TableState_FeatureMap {
    columnGroupCollapseFeature: { collapsedColumnGroups: CollapsedColumnGroupsState };
  }
  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    columnGroupCollapseFeature: ColumnGroupCollapseOptions;
  }
  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    columnGroupCollapseFeature: ColumnGroupCollapseTable;
  }
  interface Column_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    columnGroupCollapseFeature: ColumnGroupCollapseColumn;
  }
}

interface AnyColumn {
  id: string;
  table: ColumnGroupCollapseTable & { atoms: { collapsedColumnGroups: { get: () => CollapsedColumnGroupsState } } };
}

/** Which column groups are collapsed, as state the host may control. */
export const columnGroupCollapseFeature: TableFeature = {
  getInitialState: (state) => ({ collapsedColumnGroups: {}, ...state }),
  getDefaultTableOptions: (table) => ({
    onCollapsedColumnGroupsChange: makeStateUpdater('collapsedColumnGroups', table),
  }),
  constructTableAPIs: (table) => {
    assignTableAPIs('columnGroupCollapseFeature', table, {
      table_setCollapsedColumnGroups: {
        fn: (updater: Updater<CollapsedColumnGroupsState>) => setStateSlice(table, 'collapsedColumnGroups', updater),
      },
    });
  },
  assignColumnPrototype: (prototype, table) => {
    assignPrototypeAPIs('columnGroupCollapseFeature', prototype, table, {
      column_getIsCollapsed: {
        fn: (column: AnyColumn) => column.table.atoms.collapsedColumnGroups.get()[column.id] === true,
      },
      column_toggleCollapsed: {
        fn: (column: AnyColumn) =>
          column.table.setCollapsedColumnGroups((current) => ({ ...current, [column.id]: !current[column.id] })),
      },
    });
  },
};
