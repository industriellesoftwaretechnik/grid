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

import { resolveMeta, type GridColumnMeta } from '#/core/columns/columnMeta.ts';
import { isAggregationName, type AggregationName } from '#/core/table/aggregations.ts';

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
  /** The column's aggregation, chosen or from its definition; unset for none or a custom aggregation function. */
  getAggregation: () => AggregationName | undefined;
  /** The aggregations the user can choose from: `meta.aggregations`, or its data type's. None for display columns. */
  getAggregationOptions: () => readonly AggregationName[];
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
  accessorFn?: unknown;
  columnDef: { aggregationFn?: unknown; meta?: GridColumnMeta };
  table: ColumnAggregationTable & { atoms: { columnAggregation: { get: () => ColumnAggregationState } } };
}

function aggregationOf(column: AnyColumn): AggregationName | undefined {
  const chosen = column.table.atoms.columnAggregation.get()[column.id];
  const aggregation = chosen === undefined ? column.columnDef.aggregationFn : chosen;
  return isAggregationName(aggregation) ? aggregation : undefined;
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
      column_getAggregation: { fn: aggregationOf },
      column_getAggregationOptions: {
        fn: (column: AnyColumn) => (column.accessorFn ? resolveMeta(column.columnDef.meta).aggregations : []),
      },
    });
  },
};
