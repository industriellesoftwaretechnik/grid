import type { RowData } from '@tanstack/react-table';

import { filterKindOf } from '#/core/columns/columnInfo.ts';
import type { FilterKind } from '#/core/columns/columnMeta.ts';
import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { columnFilterSummary, type FilterSummary } from '#/parts/filters/filterSummary.ts';
import { numberRangeCodec, textCodec } from '#/parts/filters/inputCodecs.ts';
import { useFilterInput, type DraftInput } from '#/parts/filters/useDraftInput.ts';

/** What `useFloatingFilter` returns. */
export interface FloatingFilterModel extends DraftInput<string> {
  /** `typed` for text and numbers; `summary` for dates and sets, which show their filter and open the full editor. */
  mode: 'typed' | 'summary' | 'none';
  /** Unset where the column cannot be filtered. */
  filter: FilterKind | undefined;
  /** Unset while the column is not filtered. */
  summary: FilterSummary | undefined;
}

/** The floating filter under a header cell: an input for text and numbers, a summary for dates and sets. */
export function useFloatingFilter<TData extends RowData>(column: GridColumn<TData>): FloatingFilterModel {
  const filter = filterKindOf(column);
  const input = useFilterInput(column, filter === 'number' ? numberRangeCodec : textCodec);
  const summary = useGridSelector(column.table, () => columnFilterSummary(column));
  const mode = filter === undefined ? 'none' : filter === 'text' || filter === 'number' ? 'typed' : 'summary';
  return { ...input, invalid: mode === 'typed' && input.invalid, mode, filter, summary };
}
