import {
  assignPrototypeAPIs,
  assignTableAPIs,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type GroupingState,
  type RowData,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/table-core';

import type { ColumnAggregationState } from '#/plugins/columnAggregationFeature.ts';
import type { CollapsedColumnGroupsState } from '#/plugins/columnGroupCollapseFeature.ts';

/**
 * `columns` shows a group in the cell of its grouped column, `groupColumn` in one extra column for all levels, and
 * `rows` gives each group a full-width row.
 */
export type GroupDisplay = 'columns' | 'groupColumn' | 'rows';

/** The slices "Reset layout" returns to. */
export interface GridLayout {
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnPinning?: ColumnPinningState;
  columnVisibility?: ColumnVisibilityState;
  grouping?: GroupingState;
  columnAggregation?: ColumnAggregationState;
  collapsedColumnGroups?: CollapsedColumnGroupsState;
}

interface GridLayoutOptions {
  groupDisplay?: GroupDisplay;
  /** What `resetLayout` returns to; slices left out return to empty. */
  defaultLayout?: GridLayout;
}

interface GridLayoutTable {
  /** Returns column order, sizes, pinning, visibility, grouping, aggregation and collapsed groups to `defaultLayout`. */
  resetLayout: () => void;
}

interface GridLayoutColumn {
  /**
   * Groups or ungroups by the column as the UI does. Like AG Grid, grouping hides the column and ungrouping shows it,
   * unless the grouped columns hold the group toggles (`groupDisplay: 'columns'`).
   */
  toggleGroupBy: () => void;
}

declare module '@tanstack/table-core' {
  interface Plugins {
    gridLayoutFeature: TableFeature;
  }
  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    gridLayoutFeature: GridLayoutOptions;
  }
  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    gridLayoutFeature: GridLayoutTable;
  }
  interface Column_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    gridLayoutFeature: GridLayoutColumn;
  }
}

// The feature's runtime view of the table; the public types come from the feature maps.
interface LayoutTable {
  options: GridLayoutOptions;
  setColumnOrder: (updater: Updater<ColumnOrderState>) => void;
  setColumnSizing: (updater: Updater<ColumnSizingState>) => void;
  setColumnPinning: (updater: Updater<ColumnPinningState>) => void;
  setColumnVisibility: (updater: Updater<ColumnVisibilityState>) => void;
  setGrouping: (updater: Updater<GroupingState>) => void;
  resetExpanded: () => void;
  setColumnAggregation: (updater: Updater<ColumnAggregationState>) => void;
  setCollapsedColumnGroups: (updater: Updater<CollapsedColumnGroupsState>) => void;
}

interface LayoutColumn {
  id: string;
  table: LayoutTable;
  getIsGrouped: () => boolean;
  getCanHide: () => boolean;
  toggleGrouping: () => void;
}

function isLayoutTable(table: unknown): table is LayoutTable {
  return typeof table === 'object' && table !== null && 'options' in table && 'setColumnOrder' in table;
}

function asLayoutTable(table: unknown): LayoutTable {
  if (!isLayoutTable(table)) throw new Error('gridLayoutFeature needs a TanStack table with the column features.');
  return table;
}

function resetLayout(table: LayoutTable) {
  const layout = table.options.defaultLayout ?? {};
  table.setColumnOrder(layout.columnOrder ?? []);
  table.setColumnSizing(layout.columnSizing ?? {});
  table.setColumnPinning(layout.columnPinning ?? { start: [], end: [] });
  table.setColumnVisibility(layout.columnVisibility ?? {});
  table.setGrouping(layout.grouping ?? []);
  table.resetExpanded();
  table.setColumnAggregation(layout.columnAggregation ?? {});
  table.setCollapsedColumnGroups(layout.collapsedColumnGroups ?? {});
}

/** The layout actions of the grid's UI: grouping from the UI and "Reset layout". */
export const gridLayoutFeature: TableFeature = {
  constructTableAPIs: (table) => {
    assignTableAPIs('gridLayoutFeature', table, {
      table_resetLayout: { fn: () => resetLayout(asLayoutTable(table)) },
    });
  },
  assignColumnPrototype: (prototype, table) => {
    assignPrototypeAPIs('gridLayoutFeature', prototype, table, {
      column_toggleGroupBy: {
        fn: (column: LayoutColumn) => {
          const wasGrouped = column.getIsGrouped();
          column.toggleGrouping();
          if (column.table.options.groupDisplay !== 'columns' && column.getCanHide()) {
            column.table.setColumnVisibility((visibility) => ({ ...visibility, [column.id]: wasGrouped }));
          }
        },
      },
    });
  },
};
