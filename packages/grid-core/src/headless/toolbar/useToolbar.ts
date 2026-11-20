import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';

import { gridMeta } from '#/core/gridMeta.ts';
import { useTableContext } from '#/core/tableContext.ts';
import { gridDefaults } from '#/defaults.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { expandParents } from '#/logic/expanding/expandParents.ts';
import { downloadCsv } from '#/logic/export/csvExport.ts';

// The toolbar's hooks read the table from the grid's context, so toolbar items can be placed anywhere inside it.

/** The search across all columns. The input is uncontrolled; typing writes the search, debounced. */
export function useSearchInput() {
  const table = useTableContext();
  const setGlobalFilter = useDebouncedCallback((value: string) => table.setGlobalFilter(value), {
    wait: gridDefaults.debounceMs,
  });

  return {
    label: gridMeta(table).t('search'),
    defaultValue: String(table.atoms.globalFilter.get() ?? ''),
    change: setGlobalFilter,
  };
}

/** Downloads the rows that pass the filters as CSV, named after the table unless `fileName` is given. */
export function useExportButton(fileName?: string) {
  const table = useTableContext();
  const meta = gridMeta(table);
  return {
    label: meta.t('export'),
    exportCsv: () => downloadCsv(table, { fileName: fileName ?? meta.tableId }),
  };
}

/**
 * The grouped columns, and buttons that open and close all groups or tree nodes. `visible` is unset while there is
 * nothing to open or close.
 */
export function useGroupingBar() {
  'use no memo';
  const table = useTableContext();
  const { t, treeData, toggleRowGrouping } = gridMeta(table);
  const grouping = useGridSelector(table.atoms.grouping, (current) => current);

  return {
    visible: grouping.length > 0 || treeData,
    label: grouping.length > 0 ? t('grouped-by') : undefined,
    groups: grouping.flatMap((columnId) => {
      const column = table.getColumn(columnId);
      return column ? [{ id: columnId, label: columnLabel(column), remove: () => toggleRowGrouping(columnId) }] : [];
    }),
    removeLabel: t('group.remove'),
    expandAll: { label: t('rows.expand-all'), onClick: () => expandParents(table) },
    collapseAll: { label: t('rows.collapse-all'), onClick: () => table.toggleAllRowsExpanded(false) },
  };
}
