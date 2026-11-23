import type { RowData } from '@tanstack/react-table';

import type { GridColumn } from '#/core/types.ts';
import { RangeFilter } from '#/grid/filters/RangeFilter.tsx';
import { SetFilter } from '#/grid/filters/SetFilter.tsx';
import { TextFilter } from '#/grid/filters/TextFilter.tsx';
import type { FilterKind } from '#/logic/columns/columnMeta.ts';

/** The editor of a column's filter, by its kind. */
export function FilterEditor<TData extends RowData>({ column, kind }: { column: GridColumn<TData>; kind: FilterKind }) {
  if (kind === 'text') return <TextFilter column={column} />;
  if (kind === 'set') return <SetFilter column={column} />;
  return <RangeFilter column={column} type={kind} />;
}
