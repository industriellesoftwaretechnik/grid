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

/**
 * The aggregation chosen per column id, over the column definition's `aggregationFn`; `null` removes the one the
 * definition sets.
 */
export type ColumnAggregationState = Record<string, AggregationName | null>;

interface ColumnAggregationOptions {
  onColumnAggregationChange?: OnChangeFn<ColumnAggregationState>;
}

interface ColumnAggregationTable {
  /** Sets the aggregations chosen per column. */
  setColumnAggregation: (updater: Updater<ColumnAggregationState>) => void;
}

interface ColumnAggregationColumn {
  /** Chooses the column's aggregation; `null` turns it off. */
  setAggregation: (aggregation: AggregationName | null) => void;
  /** Returns the column's aggregation, or `undefined` for none or a custom aggregation function. */
  getAggregation: () => AggregationName | undefined;
  /** Returns the aggregations the column offers: `meta.aggregations` or the data type's, none for display columns. */
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
