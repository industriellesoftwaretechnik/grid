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
} from '@tanstack/react-table';

import { columnOrderIds, moveColumns, type OrderedTable } from '#/core/columns/columnOrder.ts';
import type { ColumnAggregationState } from '#/core/plugins/columnAggregationFeature.ts';

/**
 * `columns` shows a group in the cell of its grouped column, `groupColumn` in one extra column for all levels, and
 * `rows` gives each group a full-width row.
 */
export type GroupDisplay = 'columns' | 'groupColumn' | 'rows';

/** The slices "Reset columns" returns to. */
export interface GridLayout {
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnPinning?: ColumnPinningState;
  columnVisibility?: ColumnVisibilityState;
  grouping?: GroupingState;
  columnAggregation?: ColumnAggregationState;
}

interface GridLayoutOptions {
  groupDisplay?: GroupDisplay;
  /** What `resetLayout` returns to; slices left out return to empty. */
  defaultLayout?: GridLayout;
}

interface GridLayoutTable {
  /** Returns column order, sizes, pinning, visibility, grouping and aggregation to `defaultLayout`. */
  resetLayout: () => void;
  /** Moves the grouping level at `from` to `to`, as dragging a group panel chip does; out of range does nothing. */
  moveGrouping: (from: number, to: number) => void;
  /**
   * Moves a column to where another one is: after it when moving forward, before it when moving back, as dragging a
   * header does.
   */
  moveColumn: (columnId: string, targetId: string) => void;
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
interface LayoutTable extends OrderedTable {
  options: GridLayoutOptions;
  atoms: OrderedTable['atoms'] & { grouping: { get: () => GroupingState } };
  setColumnOrder: (updater: Updater<ColumnOrderState>) => void;
  setColumnSizing: (updater: Updater<ColumnSizingState>) => void;
  setColumnPinning: (updater: Updater<ColumnPinningState>) => void;
  setColumnVisibility: (updater: Updater<ColumnVisibilityState>) => void;
  setGrouping: (updater: Updater<GroupingState>) => void;
  resetExpanded: () => void;
  setColumnAggregation: (updater: Updater<ColumnAggregationState>) => void;
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
}

function moveGrouping(table: LayoutTable, from: number, to: number) {
  const grouping = table.atoms.grouping.get();
  if (from === to || from < 0 || to < 0 || from >= grouping.length || to >= grouping.length) return;
  table.setGrouping(grouping.toSpliced(from, 1).toSpliced(to, 0, ...grouping.slice(from, from + 1)));
}

function moveColumn(table: LayoutTable, columnId: string, targetId: string) {
  if (columnId !== targetId) table.setColumnOrder(moveColumns(columnOrderIds(table), [columnId], [targetId]));
}

/** The layout actions of the grid's UI: grouping from the UI, moving columns and grouping levels, "Reset columns". */
export const gridLayoutFeature: TableFeature = {
  constructTableAPIs: (table) => {
    assignTableAPIs('gridLayoutFeature', table, {
      table_resetLayout: { fn: () => resetLayout(asLayoutTable(table)) },
      table_moveGrouping: { fn: (from: number, to: number) => moveGrouping(asLayoutTable(table), from, to) },
      table_moveColumn: {
        fn: (columnId: string, targetId: string) => moveColumn(asLayoutTable(table), columnId, targetId),
      },
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
