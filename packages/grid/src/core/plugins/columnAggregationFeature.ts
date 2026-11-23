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
} from '@tanstack/react-table';

import type { AggregationName } from '#/core/table/aggregations.ts';

/** The aggregation chosen for a column, by column id; `null` removes the one its definition sets. */
export type ColumnAggregationState = Record<string, AggregationName | null>;

interface ColumnAggregationOptions {
  onColumnAggregationChange?: OnChangeFn<ColumnAggregationState>;
}

interface ColumnAggregationTable {
  setColumnAggregation: (updater: Updater<ColumnAggregationState>) => void;
}

interface ColumnAggregationColumn {
  /** Chooses the column's aggregation; `null` turns it off. */
  setAggregation: (aggregation: AggregationName | null) => void;
}

declare module '@tanstack/table-core' {
  interface Plugins {
    columnAggregationFeature: TableFeature;
  }
  interface TableState_FeatureMap {
    columnAggregationFeature: { columnAggregation: ColumnAggregationState };
  }
  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    columnAggregationFeature: ColumnAggregationOptions;
  }
  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    columnAggregationFeature: ColumnAggregationTable;
  }
  interface Column_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    columnAggregationFeature: ColumnAggregationColumn;
  }
}

interface AnyColumn {
  id: string;
  table: ColumnAggregationTable;
}

/** The aggregation chosen for each column, as state the host may control. */
export const columnAggregationFeature: TableFeature = {
  getInitialState: (state) => ({ columnAggregation: {}, ...state }),
  getDefaultTableOptions: (table) => ({
    onColumnAggregationChange: makeStateUpdater('columnAggregation', table),
  }),
  constructTableAPIs: (table) => {
    assignTableAPIs('columnAggregationFeature', table, {
      table_setColumnAggregation: {
        fn: (updater: Updater<ColumnAggregationState>) => setStateSlice(table, 'columnAggregation', updater),
      },
    });
  },
  assignColumnPrototype: (prototype, table) => {
    assignPrototypeAPIs('columnAggregationFeature', prototype, table, {
      column_setAggregation: {
        fn: (column: AnyColumn, aggregation: AggregationName | null) =>
          column.table.setColumnAggregation((current) => ({ ...current, [column.id]: aggregation })),
      },
    });
  },
};
