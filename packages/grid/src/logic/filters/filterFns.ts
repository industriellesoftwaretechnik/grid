import {
  constructFilterFn,
  filterFn_arrHas,
  filterFn_inDateRange,
  filterFn_includesString,
  filterFn_inNumberRange,
  type ColumnFiltersState,
  type TableState_ColumnFiltering,
  type TableState_GlobalFiltering,
} from '@tanstack/react-table';

import type { FilterKind } from '#/logic/columns/columnMeta.ts';

export const filterFns = {
  includesString: filterFn_includesString,
  inNumberRange: filterFn_inNumberRange,
  inDateRange: filterFn_inDateRange,
  // The built-in drops an empty selection as "no filter"; in a set filter it means "show nothing".
  arrHas: constructFilterFn({ ...filterFn_arrHas, autoRemove: (value: unknown) => value === undefined }),
};

export type FilterFnName = keyof typeof filterFns;

export const filterFnByKind: Record<FilterKind, FilterFnName> = {
  text: 'includesString',
  number: 'inNumberRange',
  date: 'inDateRange',
  set: 'arrHas',
};

export const selectFilterState = (
  state: TableState_ColumnFiltering & TableState_GlobalFiltering
): { columnFilters: ColumnFiltersState; globalFilter: unknown } => ({
  columnFilters: state.columnFilters,
  globalFilter: state.globalFilter,
});
