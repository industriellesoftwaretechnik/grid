import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { columnLabel, columnMeta } from '#/logic/columns/columnInfo.ts';
import { filterSummaryText } from '#/logic/filters/filterSummaryText.ts';

/** The filters tab of the side bar: every filterable column with its filter as text, each opening its editor. */
export function useFiltersPanel<TData extends RowData>(table: CoreTable<TData>) {
  'use no memo';
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const filters = useGridSelector(table.atoms.columnFilters, (current) => current);
  const columns = table.getAllLeafColumns().filter((column) => columnMeta(column).filter && column.getCanFilter());
  const toggle = (columnId: string) =>
    setOpened((current) => {
      const next = new Set(current);
      if (!next.delete(columnId)) next.add(columnId);
      return next;
    });

  return {
    items: columns.map((column) => ({
      column,
      filter: columnMeta(column).filter || 'text',
      label: columnLabel(column),
      /** The filter as text; empty while the column is not filtered. */
      summary: filterSummaryText(column, filters.find((filter) => filter.id === column.id)?.value),
      open: opened.has(column.id),
      toggle: () => toggle(column.id),
    })),
    filtered: filters.length > 0,
    clearAll: () => table.resetColumnFilters(true),
    clearAllLabel: gridMeta(table).t('filter.clear-all'),
  };
}
