import type { RowData, SortDirection } from '@tanstack/react-table';

import { columnLabel } from '#/core/columns/columnInfo.ts';
import { useTranslate } from '#/core/locale/useTranslate.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** A grouping level in the group panel. */
export interface GroupChip<TData extends RowData> {
  column: GridColumn<TData>;
  label: string;
  sorted: false | SortDirection;
  /** The column's place in a multi-sort, from 1; 0 when the table sorts by one column or none. */
  sortPosition: number;
  canSort: boolean;
  /** Sorts by the grouped column, as its header does; Ctrl adds it to a multi-sort. */
  toggleSorting: (event: unknown) => void;
  remove: () => void;
}

export interface GroupPanelModel<TData extends RowData> {
  /** The grouping levels, outermost first. */
  chips: GroupChip<TData>[];
  grouped: boolean;
  /** Moves the level at `from` to `to`, as dragging a chip does. */
  moveLevel: (from: number, to: number) => void;
  labels: {
    panel: string;
    placeholder: string;
    move: string;
    remove: string;
  };
}

const move = <T>(items: readonly T[], from: number, to: number) =>
  items.toSpliced(from, 1).toSpliced(to, 0, ...items.slice(from, from + 1));

/**
 * The row above the header that shows the grouping, one chip per level. Header columns dropped on it group by them
 * (`useColumnReorder`'s `groupBy`); chips are reordered to change the levels.
 */
export function useGroupPanel<TData extends RowData>(table: CoreTable<TData>): GroupPanelModel<TData> {
  const t = useTranslate(table);
  const { grouping, sorting } = useGridSelector(table, () => ({
    grouping: table.atoms.grouping.get(),
    sorting: table.atoms.sorting.get(),
  }));

  return {
    chips: grouping.flatMap((columnId): GroupChip<TData>[] => {
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
    }),
    grouped: grouping.length > 0,
    moveLevel: (from, to) => {
      if (from !== to && to >= 0 && to < grouping.length) table.setGrouping(move(grouping, from, to));
    },
    labels: {
      panel: t('group-panel.label'),
      placeholder: t('group-panel.placeholder'),
      move: t('group-panel.move'),
      remove: t('group.remove'),
    },
  };
}
