import { useState } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable } from '#/core/types.ts';
import { useTranslate } from '#/headless/useTranslate.ts';

export type SideBarPanel = 'columns' | 'filters';

/** AG Grid's side bar: tabs along the edge that open the columns or the filters beside the rows. */
export function useSideBar<TData extends RowData>(table: CoreTable<TData>) {
  const [open, setOpen] = useState<SideBarPanel>();
  const t = useTranslate(table);
  const labels: Record<SideBarPanel, string> = { columns: t('columns'), filters: t('filters') };

  return {
    /** The open panel, if any. */
    open,
    openLabel: open && labels[open],
    tabs: (['columns', 'filters'] as const).map((panel) => ({
      panel,
      label: labels[panel],
      selected: open === panel,
      toggle: () => setOpen(open === panel ? undefined : panel),
    })),
    close: () => setOpen(undefined),
    closeLabel: t('side-bar.close'),
  };
}

/** The columns tab of the side bar, above its `ColumnTree`. */
export function useColumnsPanel<TData extends RowData>(table: CoreTable<TData>) {
  const t = useTranslate(table);
  return {
    showAll: {
      label: t('columns.show-all'),
      onClick: () =>
        gridMeta(table).setColumnsVisible(
          table
            .getAllLeafColumns()
            .filter((column) => column.getCanHide())
            .map((column) => column.id),
          true
        ),
    },
    reset: { label: t('columns.reset'), onClick: () => gridMeta(table).resetLayout() },
  };
}
