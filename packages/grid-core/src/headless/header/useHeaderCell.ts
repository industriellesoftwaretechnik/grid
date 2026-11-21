import { useState, type CSSProperties } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { HeaderSlot } from '#/headless/header/headerRows.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useTranslate } from '#/headless/useTranslate.ts';
import { columnMeta, isExpandableGroup } from '#/logic/columns/columnInfo.ts';

const ariaSort = { asc: 'ascending', desc: 'descending' } as const;

/**
 * A header cell: `group` for a column group, `column` for a column, `placeholder` for the empty cell above a column
 * that has no group. Columns in the scrolling region are dragged sideways to reorder them, and up into the group panel
 * to group by them; this needs the cell inside `ColumnReorder`.
 */
export function useHeaderCell<TData extends RowData>({ header, region, style, sorted }: HeaderSlot<TData>) {
  const { column } = header;
  const { align, lockPosition, headerClassName } = columnMeta(column);
  const kind = header.isPlaceholder ? 'placeholder' : header.subHeaders.length > 0 ? 'group' : 'column';
  const reorderable = region === 'center' && kind === 'column' && lockPosition !== true;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: header.id,
    disabled: !reorderable,
  });
  // The cell keeps its columnheader role; dnd-kit's role="button" would hide it from screen readers.
  const { role: _role, ...dragAttributes } = attributes;
  const [filterOpen, setFilterOpen] = useState(false);
  // Only the sideways move shows; dragged up into the group panel, the column follows as the drag overlay.
  const cellStyle: CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform && { ...transform, y: 0 }),
    transition,
  };

  return {
    kind,
    reorderable,
    isDragging,
    align,
    /** The column's `headerClassName`. */
    className: headerClassName,
    /** Whether the column's filter editor is open; the column menu opens it. */
    filterOpen,
    setFilterOpen,
    cellProps: {
      ref: (node: HTMLElement | null) => {
        setNodeRef(node);
        // Keys pressed on the buttons inside bubble up here; only keys on the cell itself start a drag.
        setActivatorNodeRef(node);
      },
      colSpan: header.colSpan,
      'aria-sort': sorted ? ariaSort[sorted] : undefined,
      ...(reorderable ? { ...dragAttributes, ...listeners } : {}),
      style: cellStyle,
    },
  };
}

/** The label and collapse toggle of a column group's header. */
export function useColumnGroupHeader<TData extends RowData>({ header, collapsed }: HeaderSlot<TData>) {
  const { table } = header.column;
  const t = useTranslate(table);
  const collapsible = useGridSelector(table, () =>
    isExpandableGroup(header.column, gridMeta(table).ownColumnVisibility)
  );
  return {
    /** Whether the group has a toggle: it has columns shown only while open or only while collapsed. */
    collapsible,
    collapsed,
    toggle: () => gridMeta(table).toggleColumnGroup(header.column.id),
    toggleLabel: collapsed ? t('group.expand') : t('group.collapse'),
  };
}
