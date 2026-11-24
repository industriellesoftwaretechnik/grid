import type { RowData } from '@tanstack/react-table';

import { menuItem, type GridMenuEntry, type GridMenuSection } from '#/core/shared/menu.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';

export interface ColumnMenuOptions {
  /** Opens the column's filter editor; without it, the menu offers only to clear a filter. */
  onFilter?: () => void;
}

const pinSides = ['none', 'start', 'end'] as const;

/**
 * The header's menu: sorting, filtering, pinning, grouping and aggregation, hiding the column and "Reset columns".
 * Showing hidden columns again is the columns menu's (`useColumnsMenu`). Entries are named by their `GridMenuId`.
 */
export function columnMenu<TData extends RowData>(
  table: CoreTable<TData>,
  column: GridColumn<TData>,
  { onFilter }: ColumnMenuOptions
): GridMenuSection[] {
  if (column.columnDef.meta?.menu === false) return [];
  const sorted = column.getIsSorted();
  const pinned = column.getIsPinned() || 'none';
  const aggregations = column.getAggregationOptions();
  const aggregation = column.getAggregation();

  const sort: GridMenuEntry[] = column.getCanSort()
    ? [
        menuItem('sort.asc', () => column.toggleSorting(false), { disabled: sorted === 'asc' }),
        menuItem('sort.desc', () => column.toggleSorting(true), { disabled: sorted === 'desc' }),
        ...(sorted ? [menuItem('sort.clear', () => column.clearSorting())] : []),
      ]
    : [];
  const filter: GridMenuEntry[] = column.getCanFilter()
    ? [
        ...(onFilter ? [menuItem('filter', onFilter)] : []),
        ...(column.getIsFiltered() ? [menuItem('filter.clear', () => column.setFilterValue(undefined))] : []),
      ]
    : [];
  const layout: GridMenuEntry[] = [
    ...(column.getCanPin()
      ? [
          {
            type: 'submenu',
            id: 'pin',
            sections: [
              {
                id: 'pin',
                entries: pinSides.map((side) =>
                  menuItem(`pin.${side}`, () => column.pin(side === 'none' ? false : side), {
                    checked: pinned === side,
                  })
                ),
              },
            ],
          } satisfies GridMenuEntry,
        ]
      : []),
    ...(column.getCanGroup()
      ? [menuItem(column.getIsGrouped() ? 'group.remove' : 'group.by', () => column.toggleGroupBy())]
      : []),
    ...(aggregations.length > 0
      ? [
          {
            type: 'submenu',
            id: 'aggregation',
            sections: [
              {
                id: 'aggregation',
                entries: [
                  menuItem('aggregation.none', () => column.setAggregation(null), {
                    checked: aggregation === undefined,
                  }),
                  ...aggregations.map((name) =>
                    menuItem(`aggregation.${name}`, () => column.setAggregation(name), {
                      checked: aggregation === name,
                    })
                  ),
                ],
              },
            ],
          } satisfies GridMenuEntry,
        ]
      : []),
  ];
  const columns: GridMenuEntry[] = [
    ...(column.getCanHide() ? [menuItem('column.hide', () => column.toggleVisibility(false))] : []),
    menuItem('columns.reset', () => table.resetLayout()),
  ];

  return (
    [
      { id: 'sort', entries: sort },
      { id: 'filter', entries: filter },
      { id: 'layout', entries: layout },
      { id: 'columns', entries: columns },
    ] satisfies GridMenuSection[]
  ).filter((section) => section.entries.length > 0);
}
