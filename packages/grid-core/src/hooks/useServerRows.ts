import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

import type { FetchRows, ServerFilter } from '#/logic/server/serverRequest.ts';

export type ServerRowsStatus = 'loading' | 'loadingMore' | 'idle' | 'error';

/** The rows loaded so far and how to load more; `useGrid` hands it to the components as `meta.server`. */
export interface ServerRows {
  rowCount: number;
  /** `loading` replaces the rows, `loadingMore` appends a block. */
  status: ServerRowsStatus;
  /** Counts the times the rows were replaced from the first block on, so the view can scroll back up. */
  generation: number;
  /** Loads the next block unless one is loading or all rows are there. */
  loadMore: () => void;
  /** Repeats the request that failed. */
  retry: () => void;
}

interface Query<TData> {
  fetchRows: FetchRows<TData> | undefined;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: unknown;
}

interface Loaded<TData> {
  /** The query the rows answer; while it is not the current one, the first block of the current one is loading. */
  query: Query<TData> | undefined;
  rows: TData[];
  rowCount: number;
  generation: number;
  pending?: 'first' | 'more';
  failedOffset?: number;
}

export interface ServerRowsInput<TData> extends Query<TData> {
  blockSize: number;
  /** Called when a request is sent, so it reads the columns as they are then. */
  toServerFilters: (columnFilters: ColumnFiltersState) => ServerFilter[];
}

const noRows: never[] = [];

function statusOf<TData>(loaded: Loaded<TData>, query: Query<TData>): ServerRowsStatus {
  if (loaded.query !== query || loaded.pending === 'first') return 'loading';
  if (loaded.failedOffset !== undefined) return 'error';
  return loaded.pending === 'more' ? 'loadingMore' : 'idle';
}

/** Loads rows block by block from `fetchRows`; a new query or a new `fetchRows` starts over from the first block. */
export function useServerRows<TData>({
  fetchRows,
  blockSize,
  sorting,
  columnFilters,
  globalFilter,
  toServerFilters,
}: ServerRowsInput<TData>): {
  rows: TData[];
  server: ServerRows | undefined;
  /** Shows an edited row at once; the owner saves it in `onCellValueChange`. */
  replaceRow: (index: number, updated: TData) => void;
} {
  const query = useMemo(
    () => ({ fetchRows, sorting, columnFilters, globalFilter }),
    [fetchRows, sorting, columnFilters, globalFilter]
  );
  const [loaded, setLoaded] = useState<Loaded<TData>>({ query: undefined, rows: noRows, rowCount: 0, generation: 0 });
  const request = useRef<AbortController>(null);

  const load = (current: Query<TData>, offset: number) => {
    if (!current.fetchRows) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    current
      .fetchRows({
        sorting: current.sorting,
        filters: toServerFilters(current.columnFilters),
        search: typeof current.globalFilter === 'string' ? current.globalFilter.trim() : '',
        offset,
        limit: blockSize,
        signal: controller.signal,
      })
      .then(
        (page) => {
          if (controller.signal.aborted) return;
          setLoaded((previous) => ({
            query: current,
            rows: offset === 0 ? page.rows : [...previous.rows, ...page.rows],
            rowCount: page.rowCount,
            generation: offset === 0 ? previous.generation + 1 : previous.generation,
          }));
        },
        () => {
          if (controller.signal.aborted) return;
          setLoaded((previous) => ({
            ...previous,
            query: current,
            rows: offset === 0 ? noRows : previous.rows,
            pending: undefined,
            failedOffset: offset,
          }));
        }
      );
  };
  const loadFirst = useEffectEvent((current: Query<TData>) => load(current, 0));

  useEffect(() => {
    loadFirst(query);
    return () => request.current?.abort();
  }, [query]);

  const status = statusOf(loaded, query);
  const loadFrom = (offset: number) => {
    setLoaded((previous) => ({ ...previous, pending: offset === 0 ? 'first' : 'more', failedOffset: undefined }));
    load(query, offset);
  };

  return {
    rows: loaded.rows,
    server: fetchRows && {
      rowCount: loaded.rowCount,
      status,
      generation: loaded.generation,
      loadMore: () => {
        if (status === 'idle' && loaded.rows.length < loaded.rowCount) loadFrom(loaded.rows.length);
      },
      retry: () => {
        if (status === 'error') loadFrom(loaded.failedOffset ?? 0);
      },
    },
    replaceRow: (index, updated) =>
      setLoaded((previous) =>
        index < previous.rows.length ? { ...previous, rows: previous.rows.with(index, updated) } : previous
      ),
  };
}
