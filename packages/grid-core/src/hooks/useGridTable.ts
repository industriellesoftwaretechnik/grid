import { tableFeatures, useTable, type ColumnDef, type ReactTable, type RowData } from '@tanstack/react-table';

const features = tableFeatures({});

export type GridFeatures = typeof features;

export interface UseGridTableOptions<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<GridFeatures, TData>[];
}

export function useGridTable<TData extends RowData>({
  data,
  columns,
}: UseGridTableOptions<TData>): ReactTable<GridFeatures, TData> {
  return useTable({ features, data, columns });
}
