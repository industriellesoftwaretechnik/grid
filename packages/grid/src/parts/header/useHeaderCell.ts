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

/** What `useHeaderCell` returns. */
export interface HeaderCellModel {
  /** `placeholder` is the empty cell above a column without group. */
  kind: 'group' | 'column' | 'placeholder';
  /** A scrolling column without `meta.lockPosition`; only these can be dragged. */
  reorderable: boolean;
  align: ColumnAlign;
  /** The column's `meta.headerClassName`. */
  className: string | undefined;
  /** A column, not a group, without `meta.menu: false`. */
  hasMenu: boolean;
  /** The column has a menu and is at least 72 px wide; a narrower one leaves its menu to a right click. */
  showMenuButton: boolean;
  /** Unset where the column cannot be filtered. */
  filter: FilterKind | undefined;
  filtered: boolean;
  /** The group column's header has no text: the UI names it. */
  groupColumn: boolean;
  /** Props for the `<th>` element. */
  cellProps: {
    colSpan: number;
    'aria-sort': 'ascending' | 'descending' | undefined;
    style: CSSProperties | undefined;
  };
}

/** The header cell: its kind, menu and filter state, and props for its element. */
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
