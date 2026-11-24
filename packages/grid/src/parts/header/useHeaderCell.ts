import type { CSSProperties } from 'react';

import type { RowData } from '@tanstack/react-table';

import { columnMeta, filterKindOf } from '#/core/columns/columnInfo.ts';
import type { ColumnAlign, FilterKind } from '#/core/columns/columnMeta.ts';
import { groupColumnId } from '#/core/columns/groupColumn.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import type { HeaderSlot } from '#/parts/header/headerRows.ts';

const ariaSort = { asc: 'ascending', desc: 'descending' } as const;

/** Narrower columns show only their label; their menu opens with a right click. */
const menuButtonMinWidth = 72;

export interface HeaderCellModel {
  /** `group` for a column group, `column` for a column, `placeholder` for the empty cell above a column without group. */
  kind: 'group' | 'column' | 'placeholder';
  /** Whether the column can be dragged to another place, which only scrolling columns can. */
  reorderable: boolean;
  align: ColumnAlign;
  /** The column's `meta.headerClassName`. */
  className: string | undefined;
  /** Whether the column has a menu (`meta.menu` not `false`). */
  hasMenu: boolean;
  /** Whether the column is wide enough for a menu button beside its label. */
  showMenuButton: boolean;
  /** The kind of the column's filter editor; unset where it cannot be filtered. */
  filter: FilterKind | undefined;
  /** Whether a filter is set, which a header shows. */
  filtered: boolean;
  /** Whether it is the header of the group column (`groupDisplay: 'groupColumn'`), which has no text: the UI names it. */
  groupColumn: boolean;
  /** For the `<th>`: keeps a pinned header in place and tells the sorting. */
  cellProps: {
    colSpan: number;
    'aria-sort': 'ascending' | 'descending' | undefined;
    style: CSSProperties | undefined;
  };
}

/** A header cell: what it shows besides its label, and the props of its `<th>`. */
export function useHeaderCell<TData extends RowData>({
  header,
  region,
  style,
  sorted,
  filtered,
}: HeaderSlot<TData>): HeaderCellModel {
  const { column } = header;
  const { align, lockPosition, headerClassName } = columnMeta(column);
  const kind = header.isPlaceholder ? 'placeholder' : header.subHeaders.length > 0 ? 'group' : 'column';
  const width = useGridSelector(column.table, () => header.getSize());
  const hasMenu = kind === 'column' && column.columnDef.meta?.menu !== false;

  return {
    kind,
    reorderable: region === 'center' && kind === 'column' && lockPosition !== true,
    align,
    className: headerClassName,
    hasMenu,
    showMenuButton: hasMenu && width >= menuButtonMinWidth,
    filter: kind === 'column' ? filterKindOf(column) : undefined,
    filtered,
    groupColumn: kind === 'column' && column.id === groupColumnId,
    cellProps: { colSpan: header.colSpan, 'aria-sort': sorted ? ariaSort[sorted] : undefined, style },
  };
}
