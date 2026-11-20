import { useEffect, useRef, type ReactNode } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

import { gridMeta } from '#/core/gridMeta.ts';
import type { GridInstance } from '#/core/tableHook.tsx';
import type { GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { bodyEntries, isDetailEntry } from '#/logic/expanding/bodyEntries.ts';
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
 *
 * The React Compiler cannot memoize around `useVirtualizer`, whose object stays the same while its values change: a
 * component calling this hook opts out with `'use no memo'`.
 */
export function useVirtualRows<TData extends object>(
  table: GridInstance<TData>,
  { scrollElement, rowHeight, overscan }: VirtualRowsOptions
) {
  'use no memo';
  const { renderDetail, server } = gridMeta(table);
  const entries = bodyEntries(table.getCenterRows(), renderDetail !== undefined);
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    getItemKey: (index) => entries[index]?.id ?? index,
    overscan,
  });
  const items = virtualizer.getVirtualItems();
  const lastIndex = items.at(-1)?.index ?? -1;

  useEffect(() => {
    if (lastIndex >= entries.length - overscan) server?.loadMore();
  }, [server, lastIndex, entries.length, overscan]);
  const generation = server?.generation;
  useEffect(() => {
    if (generation !== undefined) virtualizer.scrollToOffset(0);
  }, [generation, virtualizer]);

  // Scrolls when the focus moves to another row, not when sorting moves the focused row.
  const focusedRowId = useGridSelector(table.atoms.cellSelection, (ranges) => anchorOf(ranges)?.rowId);
  const focusedIndex = entries.findIndex((entry) => entry.id === focusedRowId);
  const scrolledTo = useRef<string>(undefined);
  useEffect(() => {
    if (focusedRowId === undefined) scrolledTo.current = undefined;
    if (focusedRowId === undefined || focusedIndex < 0 || scrolledTo.current === focusedRowId) return;
    scrolledTo.current = focusedRowId;
    virtualizer.scrollToIndex(focusedIndex, { align: 'auto' });
  }, [focusedRowId, focusedIndex, virtualizer]);

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
  const sticky =
    entries.length === 0
      ? []
      : stickyGroupRows(
          entries,
          virtualizer.scrollOffset ?? 0,
          rowHeight,
          (offset) => virtualizer.getVirtualItemForOffset(offset)?.index,
          (index) => virtualizer.measurementsCache[index]?.end ?? 0
        ).flatMap(({ index, top }, level, all) => {
          const row = entries[index];
          return row && !isDetailEntry(row) ? [{ row, top, zIndex: all.length - level }] : [];
        });

  return {
    rows,
    /** Space above and below the rendered rows. */
    paddingTop: items[0]?.start ?? 0,
    paddingBottom: virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0),
    /** Group rows pinned to the top of the viewport while their group scrolls, outermost first. */
    sticky,
    /** Spans every column, the filler included. */
    colSpan: table.getVisibleLeafColumns().length + 1,
    /** The viewport's width, which a detail row's content keeps to while the columns scroll sideways. */
    viewportWidth: virtualizer.scrollRect?.width,
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
