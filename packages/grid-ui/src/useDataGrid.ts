import { AggregatedCell } from '#/grid/grouping/AggregatedCell.tsx';
import { RowCheckbox, SelectAllCheckbox } from '#/grid/selection/SelectionCheckboxes.tsx';
import { useGrid, type GridComponents, type GridInstance, type GridOptions } from '@istec/grid-core';

/** The shadcn components core renders inside its own columns. */
export const gridComponents: GridComponents = { AggregatedCell, SelectAllCheckbox, RowCheckbox };

/** `useGrid` with this package's components; pass the table to `DataGrid`. */
export function useDataGrid<TData extends object>(options: GridOptions<TData>): GridInstance<TData> {
  return useGrid({ ...options, components: gridComponents });
}
