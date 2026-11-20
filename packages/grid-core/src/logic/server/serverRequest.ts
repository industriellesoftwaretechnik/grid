import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

import type { FilterKind } from '#/logic/columns/columnMeta.ts';

type Range<T> = [T | undefined, T | undefined];

/** A column filter as the server gets it; the bounds of a range are inclusive and either may be open. */
export type ServerFilter =
  | { columnId: string; kind: 'text'; value: string }
  | { columnId: string; kind: 'number'; value: Range<number> }
  | { columnId: string; kind: 'date'; value: Range<Date> }
  /** The values to keep; `null` stands for an empty cell. */
  | { columnId: string; kind: 'set'; value: unknown[] };

/** What the server sorts and filters by. */
export interface ServerQuery {
  /** By column id, the first sort first. */
  sorting: SortingState;
  filters: ServerFilter[];
  /** The quick filter's text, trimmed; every word should match some column. */
  search: string;
}

/** What `fetchRows` gets: the query and the block of rows to return. */
export interface ServerRowsRequest extends ServerQuery {
  offset: number;
  limit: number;
  /** Aborted when the query changes before the block arrives. */
  signal: AbortSignal;
}

export interface ServerRowsPage<TData> {
  rows: TData[];
  /** All rows that match the query, not only this block. */
  rowCount: number;
}

export type FetchRows<TData> = (request: ServerRowsRequest) => Promise<ServerRowsPage<TData>>;

function isRange(value: unknown): value is [unknown, unknown] {
  return Array.isArray(value) && value.length === 2;
}

const bound = <T>(value: unknown, is: (value: unknown) => value is T): T | undefined => (is(value) ? value : undefined);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

/** Turns the table's column filters into typed ones; filters of unknown columns or malformed values are dropped. */
export function serverFilters(
  columnFilters: ColumnFiltersState,
  kindOf: (columnId: string) => FilterKind | false | undefined
): ServerFilter[] {
  return columnFilters.flatMap(({ id: columnId, value }): ServerFilter[] => {
    switch (kindOf(columnId)) {
      case 'text':
        return typeof value === 'string' && value !== '' ? [{ columnId, kind: 'text', value }] : [];
      case 'number':
        return isRange(value)
          ? [{ columnId, kind: 'number', value: [bound(value[0], isNumber), bound(value[1], isNumber)] }]
          : [];
      case 'date':
        return isRange(value)
          ? [{ columnId, kind: 'date', value: [bound(value[0], isDate), bound(value[1], isDate)] }]
          : [];
      case 'set':
        return Array.isArray(value)
          ? [
              {
                columnId,
                kind: 'set',
                value: [...new Set(value.map((item: unknown) => (item === undefined || item === '' ? null : item)))],
              },
            ]
          : [];
      default:
        return [];
    }
  });
}
