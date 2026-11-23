import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import type { CoreTable } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface ClearFiltersModel {
  /** The number of column filters set, and 1 more for a search. */
  count: number;
  /** Removes every column filter and the search. */
  clear: () => void;
  label: string;
}

/** Removes all filters at once. */
export function useClearFilters<TData extends RowData>(table: CoreTable<TData>): ClearFiltersModel {
  const t = useTranslate(table);
  const count = useGridSelector(table, () => {
    const search: unknown = table.atoms.globalFilter.get();
    return table.atoms.columnFilters.get().length + (search === undefined || search === '' ? 0 : 1);
  });

  return {
    count,
    clear: () => {
      table.resetColumnFilters(true);
      table.setGlobalFilter('');
    },
    label: t('filter.clear-all'),
  };
}
