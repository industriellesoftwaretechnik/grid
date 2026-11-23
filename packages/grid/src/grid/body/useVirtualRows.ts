import { useEffect, useRef, useState, type ReactNode } from 'react';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { useVirtualView } from '#/hooks/useVirtualView.ts';
import { bodyEntries, createBodyEntriesCache, isDetailEntry, type BodyEntry } from '#/logic/expanding/bodyEntries.ts';
import { indexOfId } from '#/logic/focus/gridCells.ts';
import { stickyGroupRows } from '#/logic/grouping/stickyGroups.ts';
import { anchorOf } from '#/logic/selection/cellRanges.ts';

export type VirtualRow<TData extends object> =
  | { kind: 'row'; key: string; index: number; row: GridRow<TData> }
  /** The full-width row under an expanded master row. */
  | { kind: 'detail'; key: string; index: number; row: GridRow<TData>; detail: ReactNode };

export interface VirtualRowsOptions {
  scrollElement: HTMLElement | null;
  rowHeight: number;
  /** Rows rendered beyond each edge of the viewport. */
  overscan: number;
}

/**
 * The scrolling rows that are in view, with the padding that stands for the others, the group rows that stick to the
 * top while their group scrolls, and the state of server rows. It scrolls to the focused row when the focus moves to
 * another row, and loads the next block of server rows near the end.
 */
export function useVirtualRows<TData extends object>(
  table: GridInstance<TData>,
  { scrollElement, rowHeight, overscan }: VirtualRowsOptions
) {
  const [cachedEntries] = useState(() => createBodyEntriesCache<GridRow<TData>>());
  const { entries, server, focusedRowId, colSpan } = useGridSelector(table, () => {
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
      server: meta.server,
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
  const lastIndex = items.at(-1)?.index ?? -1;

  useEffect(() => {
    if (lastIndex >= entries.length - overscan) server?.loadMore();
  }, [server, lastIndex, entries.length, overscan]);
  const generation = server?.generation;
  useEffect(() => {
    if (generation !== undefined) virtualizer.scrollToOffset(0);
  }, [generation, virtualizer]);

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
    /** Space above and below the rendered rows. */
    paddingTop: items[0]?.start ?? 0,
    paddingBottom: view.totalSize - (items.at(-1)?.end ?? 0),
    /** Group rows pinned to the top of the viewport while their group scrolls, outermost first. */
    sticky: stickyRows(entries, view, rowHeight),
    /** Spans every column, the filler included. */
    colSpan,
    /** The viewport's width, which a detail row's content keeps to while the columns scroll sideways. */
    viewportWidth: view.viewportWidth,
    /** Pass to each rendered row's `ref`, so rows of other heights, such as details, are measured. */
    measureElement: virtualizer.measureElement,
    /** `empty` when no row passes the filters; `loading` while the first block of server rows loads. */
    status:
      server?.status === 'error'
        ? ('error' as const)
        : entries.length > 0
          ? server?.status === 'loadingMore'
            ? ('loadingMore' as const)
            : ('ready' as const)
          : server?.status === 'loading'
            ? ('loading' as const)
            : ('empty' as const),
    retry: () => server?.retry(),
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
