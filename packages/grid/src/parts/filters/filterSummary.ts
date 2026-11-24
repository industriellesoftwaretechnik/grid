import type { RowData } from '@tanstack/react-table';

import { columnMeta } from '#/core/columns/columnInfo.ts';
import type { FilterKind } from '#/core/columns/columnMeta.ts';
import { formatValue } from '#/core/columns/format.ts';
import type { GridColumn } from '#/core/table/types.ts';

/**
 * A filter as the UI summarizes it, such as on a floating filter's button: the typed text, the bounds of a range, or
 * the chosen values of a set with `blank` for the blank one. The values are text, as the column shows them.
 */
export type FilterSummary =
  | { kind: 'text'; text: string }
  | { kind: 'range'; from: string | undefined; to: string | undefined }
  | { kind: 'set'; values: string[]; blank: boolean };

const isBlank = (value: unknown) => value === null || value === undefined || value === '';

/** A filter value as its summary; unset when nothing is filtered. */
export function filterSummary(
  kind: FilterKind,
  value: unknown,
  format: (value: unknown) => string
): FilterSummary | undefined {
  if (value === undefined) return undefined;
  if (kind === 'text') return typeof value === 'string' ? { kind, text: value } : undefined;
  if (!Array.isArray(value)) return undefined;
  if (kind === 'set') {
    return {
      kind,
      values: [...new Set(value.filter((item) => !isBlank(item)).map(format))],
      blank: value.some(isBlank),
    };
  }
  const [from, to] = [value[0], value[1]].map((bound) => (bound === undefined ? undefined : format(bound)));
  return from === undefined && to === undefined ? undefined : { kind: 'range', from, to };
}

/** A column's filter as its summary, its values formatted as the column shows them. */
export function columnFilterSummary<TData extends RowData>(column: GridColumn<TData>): FilterSummary | undefined {
  const { filter } = columnMeta(column);
  if (!filter) return undefined;
  return filterSummary(filter, column.getFilterValue(), (item) => formatValue(item, column));
}
