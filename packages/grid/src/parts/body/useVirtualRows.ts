import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import { anchorOf } from '#/core/selection/cellRanges.ts';
import { indexOfId } from '#/core/selection/gridCells.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable, GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { bodyEntries, createBodyEntriesCache, isDetailEntry, type BodyEntry } from '#/parts/body/bodyEntries.ts';
import { stickyGroupRows } from '#/parts/body/stickyGroups.ts';
import { useVirtualView } from '#/parts/view/useVirtualView.ts';

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
 * The scrolling rows that are in view, with the padding that stands for the others, and the group rows that stick to
 * the top while their group scrolls. It scrolls to the focused row when the focus moves to another row.
 */
export function useVirtualRows<TData extends object>(
  table: CoreTable<TData>,
  { scrollElement, rowHeight, overscan }: VirtualRowsOptions
) {
  const t = useTranslate(table);
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
    /** Whether no row passes the filters. */
    empty: entries.length === 0,
    labels: { noRows: t('no-results') },
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

/** What `useVirtualRows` gives the scrolling rows. */
export type VirtualRowsModel = ReturnType<typeof useVirtualRows>;
