import { useEffect, useRef, useState, type FocusEvent, type UIEvent } from 'react';

import { hasAggregations } from '#/core/columns/columnInfo.ts';
import { displayedColumns, displayedRowIds } from '#/core/selection/gridCells.ts';
import { gridEvents, keepNativeContextMenu, listenToClipboard } from '#/core/selection/gridEvents.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { GridInstance } from '#/core/table/tableHook.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { pinnedOffsetVariables } from '#/parts/view/layout.ts';

/** Options of `useGridView`. */
export interface GridViewOptions {
  /** In px; Page Up and Page Down move by the rows that fit the body. */
  rowHeight: number;
  /** Marks the grid busy. Default: `false`. */
  loading?: boolean;
  /** Shows the totals row where some visible column aggregates. */
  showTotals: boolean;
  /** Shows the group panel where some column can be grouped. */
  showGroupPanel: boolean;
}

/**
 * The grid's frame: props for the grid, header, footer and body scroll elements. Header, body and footer are separate
 * tables sharing the column widths; header and footer scroll with the body.
 */
export function useGridView<TData extends object>(
  table: GridInstance<TData>,
  { rowHeight, loading = false, showTotals, showGroupPanel }: GridViewOptions
) {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { tableId } = gridMeta(table);
  const view = useGridSelector(table, () => ({
    noFocus: table.atoms.cellSelection.get().length === 0,
    topRows: table.getTopRows(),
    bottomRows: table.getBottomRows(),
    aggregates: hasAggregations(table.getVisibleLeafColumns()),
    groupable: table.getAllLeafColumns().some((column) => column.getCanGroup()),
    pinnedOffsets: pinnedOffsetVariables(table),
  }));
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
    busy: loading,
    /** The rows pinned to the top; they render outside the virtual rows. */
    topRows: view.topRows,
    /** The rows pinned to the bottom; they render outside the virtual rows. */
    bottomRows: view.bottomRows,
    /** Whether to show the totals row: asked for, and some visible column aggregates. */
    totals: showTotals && view.aggregates,
    /** Whether to show the group panel: asked for, and some column can be grouped. */
    groupPanel: showGroupPanel && view.groupable,
    /** The body's scroll element, for `useVirtualRows`; `null` until it mounts. */
    scrollElement,
    /** Props for the element around header, body and footer; the UI gives it its accessible name. */
    gridProps: {
      ref: gridRef,
      role: 'grid',
      tabIndex: -1,
      'aria-busy': loading,
      'data-table-id': tableId,
      'data-grid-body': '',
      onKeyDown: events.onKeyDown,
      // Body cells read their sticky offsets from these, so resizing a column re-renders no row.
      style: view.pinnedOffsets,
    },
    /** Props for the header's scroll container, which follows the body's horizontal scroll; hide its scrollbar. */
    headerProps: { ref: headerRef },
    /** Props for the footer's scroll container, which follows the body's horizontal scroll; hide its scrollbar. */
    footerProps: { ref: footerRef },
    /** Props for the body's scroll container; tabbing into it lands on the focused cell, or focuses the first one. */
    scrollProps: {
      ref: setScrollElement,
      tabIndex: view.noFocus ? 0 : -1,
      onFocus: (event: FocusEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;
        const rowId = displayedRowIds(table).at(0);
        const column = displayedColumns(table)[0];
        if (rowId !== undefined && column && table.atoms.cellSelection.get().length === 0) {
          table.setFocusedCell(rowId, column.id);
        }
      },
      onScroll: (event: UIEvent<HTMLElement>) => {
        const { scrollLeft } = event.currentTarget;
        if (headerRef.current) headerRef.current.scrollLeft = scrollLeft;
        if (footerRef.current) footerRef.current.scrollLeft = scrollLeft;
      },
    },
  };
}

/** What `useGridView` returns. */
export type GridViewModel = ReturnType<typeof useGridView>;
