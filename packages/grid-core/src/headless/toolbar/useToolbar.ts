import { useState } from 'react';

import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';

import { gridMeta } from '#/core/gridMeta.ts';
import { useTableContext } from '#/core/tableContext.ts';
import { gridDefaults } from '#/defaults.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useTranslate } from '#/headless/useTranslate.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { expandParents } from '#/logic/expanding/expandParents.ts';
import { downloadCsv } from '#/logic/export/csvExport.ts';

// The toolbar's hooks read the table from the grid's context, so toolbar items can be placed anywhere inside it.

/** The search across all columns. The input is uncontrolled; typing writes the search, debounced. */
export function useSearchInput() {
  const table = useTableContext();
  const t = useTranslate(table);
  const [defaultValue] = useState(() => String(table.atoms.globalFilter.get() ?? ''));
  const setGlobalFilter = useDebouncedCallback((value: string) => table.setGlobalFilter(value), {
    wait: gridDefaults.debounceMs,
  });

  return {
    label: t('search'),
    defaultValue,
    change: setGlobalFilter,
  };
}

/** Downloads the rows that pass the filters as CSV, named after the table unless `fileName` is given. */
export function useExportButton(fileName?: string) {
  const table = useTableContext();
  const t = useTranslate(table);
  return {
    label: t('export'),
    exportCsv: () => downloadCsv(table, { fileName: fileName ?? gridMeta(table).tableId }),
  };
}

/**
 * The grouped columns, and buttons that open and close all groups or tree nodes. `visible` is unset while there is
 * nothing to open or close.
 */
export function useGroupingBar() {
  const table = useTableContext();
  const t = useTranslate(table);
  const { treeData, columns } = useGridSelector(table, () => ({
    treeData: gridMeta(table).treeData,
    columns: table.atoms.grouping.get().flatMap((columnId) => table.getColumn(columnId) ?? []),
  }));

  return {
    visible: columns.length > 0 || treeData,
    label: columns.length > 0 ? t('grouped-by') : undefined,
    groups: columns.map((column) => ({
      id: column.id,
      label: columnLabel(column),
      remove: () => gridMeta(table).toggleRowGrouping(column.id),
    })),
    removeLabel: t('group.remove'),
    expandAll: { label: t('rows.expand-all'), onClick: () => expandParents(table) },
    collapseAll: { label: t('rows.collapse-all'), onClick: () => table.toggleAllRowsExpanded(false) },
  };
}
