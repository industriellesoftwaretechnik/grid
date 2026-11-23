import type { RowData } from '@tanstack/react-table';

import { columnMeta } from '#/core/columns/columnInfo.ts';
import { menuItem, type GridMenuEntry, type GridMenuSection } from '#/core/shared/menu.ts';
import { aggregationSymbols, isAggregationName } from '#/core/table/aggregations.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable, GridColumn } from '#/core/table/types.ts';

export interface ColumnMenuOptions {
  /** Opens the column's filter editor. */
  onFilter: () => void;
}

/**
 * The header's menu: sorting, filtering, pinning, grouping and aggregation, hiding the column and "Reset columns".
 * Showing hidden columns again is the columns menu's (`useColumnsMenu`).
 */
export function columnMenu<TData extends RowData>(
  table: CoreTable<TData>,
  column: GridColumn<TData>,
  { onFilter }: ColumnMenuOptions
): GridMenuSection[] {
  if (column.columnDef.meta?.menu === false) return [];
  const { t } = gridMeta(table);
  const sorted = column.getIsSorted();
  const pinned = column.getIsPinned();
  const aggregations = column.accessorFn ? columnMeta(column).aggregations : [];
  const { aggregationFn } = column.columnDef;
  const chosen = table.atoms.columnAggregation.get()[column.id];
  const chosenAggregation = chosen !== undefined ? (chosen ?? undefined) : aggregationFn;

  const sections: (GridMenuSection | false)[] = [
    column.getCanSort() && {
      id: 'sort',
      entries: [
        menuItem('sort.asc', t('sort.asc'), 'sort-asc', () => column.toggleSorting(false), {
          disabled: sorted === 'asc',
        }),
        menuItem('sort.desc', t('sort.desc'), 'sort-desc', () => column.toggleSorting(true), {
          disabled: sorted === 'desc',
        }),
        ...(sorted ? [menuItem('sort.clear', t('sort.clear'), 'clear', () => column.clearSorting())] : []),
      ],
    },
    column.getCanFilter() && {
      id: 'filter',
      entries: [
        menuItem('filter', t('filter'), 'filter', onFilter),
        ...(column.getIsFiltered()
          ? [menuItem('filter.clear', t('filter.clear'), 'clear', () => column.setFilterValue(undefined))]
          : []),
      ],
    },
    (column.getCanPin() || column.getCanGroup() || aggregations.length > 0) && {
      id: 'layout',
      entries: [
        ...(column.getCanPin()
          ? [
              {
                type: 'submenu',
                id: 'pin',
                label: t('pin'),
                icon: 'pin',
                sections: [
                  {
                    id: 'pin',
                    entries: (['none', 'start', 'end'] as const).map((side) =>
                      menuItem(
                        `pin.${side}`,
                        t(`pin.${side}`),
                        undefined,
                        () => column.pin(side === 'none' ? false : side),
                        { checked: (pinned || 'none') === side }
                      )
                    ),
                  },
                ],
              } satisfies GridMenuEntry,
            ]
          : []),
        ...(column.getCanGroup()
          ? [
              menuItem('group', column.getIsGrouped() ? t('group.remove') : t('group.by'), 'group', () =>
                column.toggleGroupBy()
              ),
            ]
          : []),
        ...(aggregations.length > 0
          ? [
              {
                type: 'submenu',
                id: 'aggregation',
                label: t('aggregation'),
                icon: 'aggregation',
                sections: [
                  {
                    id: 'aggregation',
                    entries: [
                      menuItem(
                        'aggregation.none',
                        t('aggregation.none'),
                        undefined,
                        () => column.setAggregation(null),
                        {
                          checked: !isAggregationName(chosenAggregation),
                        }
                      ),
                      ...aggregations.map((name) =>
                        menuItem(
                          `aggregation.${name}`,
                          t(`aggregation.${name}`),
                          undefined,
                          () => column.setAggregation(name),
                          { checked: chosenAggregation === name, hint: aggregationSymbols[name] }
                        )
                      ),
                    ],
                  },
                ],
              } satisfies GridMenuEntry,
            ]
          : []),
      ],
    },
    {
      id: 'columns',
      entries: [
        ...(column.getCanHide()
          ? [menuItem('hide', t('column.hide'), 'hide', () => column.toggleVisibility(false))]
          : []),
        menuItem('columns.reset', t('columns.reset'), 'reset', () => table.resetLayout()),
      ],
    },
  ];
  return sections.filter((section) => section !== false);
}
