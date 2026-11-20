import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable, GridColumn } from '#/core/types.ts';
import type { MenuEntry, MenuSection } from '#/headless/menu.ts';
import { columnMeta } from '#/logic/columns/columnInfo.ts';
import { aggregationSymbols, isAggregationName } from '#/logic/grouping/aggregations.ts';

const none = 'none';

export interface ColumnMenuOptions {
  /** Opens the column's filter editor. */
  onFilter: () => void;
}

/** The header's context menu: sorting, filtering, pinning, grouping and aggregation, hiding. */
export function columnMenu<TData extends RowData>(
  table: CoreTable<TData>,
  column: GridColumn<TData>,
  { onFilter }: ColumnMenuOptions
): MenuSection[] {
  if (column.columnDef.meta?.menu === false) return [];
  const meta = gridMeta(table);
  const { t } = meta;
  const sorted = column.getIsSorted();
  const pinned = column.getIsPinned();
  const aggregations = column.accessorFn ? columnMeta(column).aggregations : [];
  const { aggregationFn } = column.columnDef;

  const sections: (MenuSection | false)[] = [
    column.getCanSort() && {
      id: 'sort',
      entries: [
        item('sort.asc', t('sort.asc'), 'sort-asc', () => column.toggleSorting(false), sorted === 'asc'),
        item('sort.desc', t('sort.desc'), 'sort-desc', () => column.toggleSorting(true), sorted === 'desc'),
        ...(sorted ? [item('sort.clear', t('sort.clear'), 'clear', () => column.clearSorting())] : []),
      ],
    },
    column.getCanFilter() && {
      id: 'filter',
      entries: [
        item('filter', t('filter'), 'filter', onFilter),
        ...(column.getIsFiltered()
          ? [item('filter.clear', t('filter.clear'), 'clear', () => column.setFilterValue(undefined))]
          : []),
      ],
    },
    column.getCanPin() && {
      id: 'pin',
      entries: [
        {
          type: 'choice',
          id: 'pin',
          label: t('pin'),
          icon: 'pin',
          value: pinned || none,
          options: [
            { value: none, label: t('pin.none') },
            { value: 'start', label: t('pin.start') },
            { value: 'end', label: t('pin.end') },
          ],
          onChange: (value) => column.pin(value === 'start' || value === 'end' ? value : false),
        },
      ],
    },
    (column.getCanGroup() || aggregations.length > 0) && {
      id: 'group',
      entries: [
        ...(column.getCanGroup()
          ? [
              item('group', column.getIsGrouped() ? t('group.remove') : t('group.by'), 'group', () =>
                meta.toggleRowGrouping(column.id)
              ),
            ]
          : []),
        ...(aggregations.length > 0
          ? [
              {
                type: 'choice',
                id: 'aggregation',
                label: t('aggregation'),
                icon: 'aggregation',
                value: typeof aggregationFn === 'string' ? aggregationFn : none,
                options: [
                  { value: none, label: t('aggregation.none') },
                  ...aggregations.map((name) => ({
                    value: name,
                    label: t(`aggregation.${name}`),
                    hint: aggregationSymbols[name],
                  })),
                ],
                onChange: (value) => meta.setColumnAggregation(column.id, isAggregationName(value) ? value : null),
              } satisfies MenuEntry,
            ]
          : []),
      ],
    },
    column.getCanHide() && {
      id: 'hide',
      entries: [item('hide', t('column.hide'), 'hide', () => column.toggleVisibility(false))],
    },
  ];
  return sections.filter((section) => section !== false);
}

function item(id: string, label: string, icon: MenuEntry['icon'], onSelect: () => void, disabled = false): MenuEntry {
  return { type: 'item', id, label, icon, onSelect, disabled };
}
