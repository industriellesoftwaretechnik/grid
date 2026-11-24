import type { RowData, SortDirection } from '@tanstack/react-table';

import { columnLabel } from '#/core/columns/columnInfo.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** A grouping level in the group panel. */
export interface GroupChip<TData extends RowData> {
  column: GridColumn<TData>;
  /** The column's name. */
  label: string;
  sorted: false | SortDirection;
  /** The column's place in a multi-sort, from 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
  canSort: boolean;
  /** Sorts by the grouped column, as its header does; Ctrl adds it to a multi-sort. */
  toggleSorting: (event: unknown) => void;
  remove: () => void;
}

/**
 * The grouping levels, outermost first, as chips of the row above the header. Header columns dropped on it group by
 * them (`useColumnReorder`'s `groupBy`); `table.moveGrouping` reorders the levels.
 */
export function useGroupPanel<TData extends RowData>(table: CoreTable<TData>): GroupChip<TData>[] {
  const { grouping, sorting } = useGridSelector(table, () => ({
    grouping: table.atoms.grouping.get(),
    sorting: table.atoms.sorting.get(),
  }));

  return grouping.flatMap((columnId): GroupChip<TData>[] => {
    const column = table.getColumn(columnId);
    if (!column) return [];
    const sortIndex = sorting.findIndex((sort) => sort.id === columnId);
    const sort = sorting[sortIndex];
    return [
      {
        column,
        label: columnLabel(column),
        sorted: sort ? (sort.desc ? 'desc' : 'asc') : false,
        sortPosition: sorting.length > 1 && sortIndex >= 0 ? sortIndex + 1 : 0,
        canSort: column.getCanSort(),
        toggleSorting: (event) => column.getToggleSortingHandler()?.(event),
        remove: () => column.toggleGroupBy(),
      },
    ];
  });
}
