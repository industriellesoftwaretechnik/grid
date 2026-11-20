import { useEffect, useRef, useState, type FocusEvent, type UIEvent } from 'react';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridInstance } from '#/core/tableHook.tsx';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { hasAggregations } from '#/logic/columns/columnInfo.ts';
import { displayedColumns, displayedRows } from '#/logic/focus/gridCells.ts';
import { gridEvents, keepNativeContextMenu, listenToClipboard } from '#/logic/focus/gridEvents.ts';
import { pinnedOffsetVariables } from '#/logic/layout.ts';

export interface GridViewOptions {
  rowHeight: number;
  /** Covers the rows, such as while they are fetched. Rows from `fetchRows` do this themselves. */
  loading?: boolean;
  showTotals: boolean;
  showGroupPanel: boolean;
}

/**
 * The frame of the grid: the element with the grid role and its keyboard and clipboard handling, the scrolling body,
 * and the header and footer that scroll sideways with it. Header, body and footer are separate tables that share the
 * column widths.
 */
export function useGridView<TData extends object>(
  table: GridInstance<TData>,
  { rowHeight, loading = false, showTotals, showGroupPanel }: GridViewOptions
) {
  'use no memo';
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const meta = gridMeta(table);
  const busy = loading || meta.server?.status === 'loading';
  const noFocus = useGridSelector(table.atoms.cellSelection, (ranges) => ranges.length === 0);
  const events = gridEvents(table, () => Math.max(1, Math.floor((scrollElement?.clientHeight ?? 0) / rowHeight) - 1));

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return undefined;
    const stopClipboard = listenToClipboard(table, root);
    const stopNativeMenu = keepNativeContextMenu(root);
    return () => {
      stopClipboard();
      stopNativeMenu();
    };
  }, [table]);

  return {
    busy,
    topRows: table.getTopRows(),
    bottomRows: table.getBottomRows(),
    /** Whether to show the totals row: asked for, and some visible column aggregates. */
    totals: showTotals && hasAggregations(table.getVisibleLeafColumns()),
    /** Whether to show the group panel: asked for, and some column can be grouped. */
    groupPanel: showGroupPanel && table.getAllLeafColumns().some((column) => column.getCanGroup()),
    /** The scrolling element, for `useVirtualRows`. */
    scrollElement,
    /** For the element around header, body and footer. AG Grid's root has the grid role too. */
    gridProps: {
      ref: gridRef,
      role: 'grid',
      tabIndex: -1,
      'aria-label': meta.tableId,
      'aria-busy': busy,
      'data-table-id': meta.tableId,
      'data-grid-body': '',
      onKeyDown: events.onKeyDown,
      // Body cells read their sticky offsets from these, so resizing a column re-renders no row.
      style: pinnedOffsetVariables(table),
    },
    /** For the header's and the footer's scroll containers, which hide their scrollbars. */
    headerProps: { ref: headerRef },
    footerProps: { ref: footerRef },
    /** For the body's scroll container. Tabbing into it lands on the focused cell, or focuses the first one. */
    scrollProps: {
      ref: setScrollElement,
      tabIndex: noFocus ? 0 : -1,
      onFocus: (event: FocusEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;
        const row = displayedRows(table)[0];
        const column = displayedColumns(table)[0];
        if (row && column && table.atoms.cellSelection.get().length === 0) table.setFocusedCell(row.id, column.id);
      },
      onScroll: (event: UIEvent<HTMLElement>) => {
        const { scrollLeft } = event.currentTarget;
        if (headerRef.current) headerRef.current.scrollLeft = scrollLeft;
        if (footerRef.current) footerRef.current.scrollLeft = scrollLeft;
      },
    },
  };
}
