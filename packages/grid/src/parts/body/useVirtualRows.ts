import { useEffect, useRef, useState, type ReactNode } from 'react';

import { anchorOf } from '#/core/selection/cellRanges.ts';
import { indexOfId } from '#/core/selection/gridCells.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable, GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { bodyEntries, createBodyEntriesCache, isDetailEntry, type BodyEntry } from '#/parts/body/bodyEntries.ts';
import { stickyGroupRows } from '#/parts/body/stickyGroups.ts';
import { useVirtualView } from '#/parts/view/useVirtualView.ts';

/** A body row in view: a data or group row, or the detail row under an open master row. */
export type VirtualRow<TData extends object> =
  | { kind: 'row'; key: string; index: number; row: GridRow<TData> }
  | { kind: 'detail'; key: string; index: number; row: GridRow<TData>; detail: ReactNode };

/** Options of `useVirtualRows`. */
export interface VirtualRowsOptions {
  /** `useGridView`'s `scrollElement`. */
  scrollElement: HTMLElement | null;
  /** In px; detail rows are measured. */
  rowHeight: number;
  /** The rows rendered beyond each end of the view. */
  overscan: number;
}

/**
 * The body's rows in view, with the padding around them and the group rows that stick to the top. It scrolls to the
 * focused row when the focus moves to another row.
 */
export function useVirtualRows<TData extends object>(
  table: CoreTable<TData>,
  { scrollElement, rowHeight, overscan }: VirtualRowsOptions
) {
  const [cachedEntries] = useState(() => createBodyEntriesCache<GridRow<TData>>());
  const { entries, focusedRowId, colSpan } = useGridSelector(table, () => {
    const meta = gridMeta(table);
    const rows = table.getCenterRows();
    return {
      // A master row opens without changing the rows, so the details are part of what is selected.
      entries:
        meta.renderDetail === undefined
          ? rows
          : table.options.getIsRowExpanded
            ? bodyEntries(rows, true)
            : cachedEntries(rows, table.atoms.expanded.get()),
      focusedRowId: anchorOf(table.atoms.cellSelection.get())?.rowId,
      colSpan: table.getVisibleLeafColumns().length + 1,
    };
  });
  const view = useVirtualView({
    count: entries.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    getItemKey: (index) => entries[index]?.id ?? index,
    overscan,
  });
  const { virtualizer, items } = view;

  // Scrolls when the focus moves to another row, not when sorting moves the focused row.
  const focusedIndex = focusedRowId === undefined ? -1 : indexOfId(entries, focusedRowId);
  const scrolledTo = useRef<string>(undefined);
  useEffect(() => {
    if (focusedRowId === undefined) scrolledTo.current = undefined;
    if (focusedRowId === undefined || focusedIndex < 0 || scrolledTo.current === focusedRowId) return;
    scrolledTo.current = focusedRowId;
    virtualizer.scrollToIndex(focusedIndex, { align: 'auto' });
  }, [focusedRowId, focusedIndex, virtualizer]);

  const { renderDetail } = gridMeta(table);
  const rows = items.flatMap((item): VirtualRow<TData>[] => {
    const entry = entries[item.index];
    if (!entry) return [];
    return isDetailEntry(entry)
      ? [
          {
            kind: 'detail',
            key: entry.id,
            index: item.index,
            row: entry.detailOf,
            detail: renderDetail?.(entry.detailOf.id),
          },
        ]
      : [{ kind: 'row', key: entry.id, index: item.index, row: entry }];
  });

  return {
    rows,
    /** In px, for a spacer row above the rows. */
    paddingTop: items[0]?.start ?? 0,
    /** In px, for a spacer row below the rows. */
    paddingBottom: view.totalSize - (items.at(-1)?.end ?? 0),
    /** The group rows stuck to the top, outermost first; `top` is in px. */
    sticky: stickyRows(entries, view, rowHeight),
    /** Spans every column, the filler included. */
    colSpan,
    /** The body's visible width in px; a detail row's content keeps to it while the columns scroll sideways. */
    viewportWidth: view.viewportWidth,
    /** The `ref` of each rendered row with its `data-index`, so details and other heights are measured. */
    measureElement: virtualizer.measureElement,
    /** No row passes the filters. */
    empty: entries.length === 0,
  };
}

function stickyRows<TData extends object>(
  entries: BodyEntry<GridRow<TData>>[],
  { virtualizer, scrollOffset }: ReturnType<typeof useVirtualView<HTMLElement>>,
  rowHeight: number
) {
  if (entries.length === 0) return [];
  return stickyGroupRows(
    entries,
    scrollOffset,
    rowHeight,
    (offset) => virtualizer.getVirtualItemForOffset(offset)?.index,
    (index) => virtualizer.measurementsCache[index]?.end ?? 0
  ).flatMap(({ index, top }, level, all) => {
    const row = entries[index];
    return row && !isDetailEntry(row) ? [{ row, top, zIndex: all.length - level }] : [];
  });
}

/** What `useVirtualRows` returns. */
export type VirtualRowsModel = ReturnType<typeof useVirtualRows>;
