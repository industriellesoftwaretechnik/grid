import type { RowData } from '@tanstack/react-table';

import { filterKindOf } from '#/core/columns/columnInfo.ts';
import type { FilterKind } from '#/core/columns/columnMeta.ts';
import type { GridColumn } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { columnFilterSummary, type FilterSummary } from '#/parts/filters/filterSummary.ts';
import { numberRangeCodec, textCodec } from '#/parts/filters/inputCodecs.ts';
import { useFilterInput, type DraftInput } from '#/parts/filters/useDraftInput.ts';

export interface FloatingFilterModel extends DraftInput<string> {
  /**
   * `typed` for text and numbers, which are typed in, numbers also as `≥ 5` or `5 – 10`; `summary` for dates and
   * sets, which show their filter as text and open the full editor; `none` where the column cannot be filtered.
   */
  mode: 'typed' | 'summary' | 'none';
  filter: FilterKind | undefined;
  /** For `summary`: the filter, for the button that opens its editor. */
  summary: FilterSummary | undefined;
}

/** The filter in the row under the header, as in AG Grid. For `typed`, the input's text and actions. */
export function useFloatingFilter<TData extends RowData>(column: GridColumn<TData>): FloatingFilterModel {
  const filter = filterKindOf(column);
  const input = useFilterInput(column, filter === 'number' ? numberRangeCodec : textCodec);
  const summary = useGridSelector(column.table, () => columnFilterSummary(column));
  const mode = filter === undefined ? 'none' : filter === 'text' || filter === 'number' ? 'typed' : 'summary';
  return { ...input, invalid: mode === 'typed' && input.invalid, mode, filter, summary };
}
