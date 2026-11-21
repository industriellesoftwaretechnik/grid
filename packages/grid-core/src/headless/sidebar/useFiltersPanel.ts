import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { CoreTable } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useTranslate } from '#/headless/useTranslate.ts';
import { columnLabel, filterKindOf } from '#/logic/columns/columnInfo.ts';
import { filterSummaryText } from '#/logic/filters/filterSummaryText.ts';

/** The filters tab of the side bar: every filterable column with its filter as text, each opening its editor. */
export function useFiltersPanel<TData extends RowData>(table: CoreTable<TData>) {
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const t = useTranslate(table);
  const { columns, filtered } = useGridSelector(table, () => ({
    columns: table.getAllLeafColumns().flatMap((column) => {
      const filter = filterKindOf(column);
      return filter === undefined
        ? []
        : [{ column, filter, summary: filterSummaryText(column, column.getFilterValue()) }];
    }),
    filtered: table.atoms.columnFilters.get().length > 0,
  }));
  const toggle = (columnId: string) =>
    setOpened((current) => {
      const next = new Set(current);
      if (!next.delete(columnId)) next.add(columnId);
      return next;
    });

  return {
    items: columns.map(({ column, filter, summary }) => ({
      column,
      filter,
      label: columnLabel(column),
      /** The filter as text; empty while the column is not filtered. */
      summary,
      open: opened.has(column.id),
      toggle: () => toggle(column.id),
    })),
    filtered,
    clearAll: () => table.resetColumnFilters(true),
    clearAllLabel: t('filter.clear-all'),
  };
}
