import type { RowData } from '@tanstack/react-table';

import { useTranslate } from '#/core/locale/useTranslate.ts';
import type { GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface RowToggleModel {
  /** Whether the row has a toggle: a group, a tree node with children or a master row. */
  canExpand: boolean;
  expanded: boolean;
  /** The number of records in a group row. */
  count: number;
  /**
   * For the toggle button. Its presses stay on it: they neither focus nor select the cell, start a range or an edit,
   * nor reach the row's own click handlers.
   */
  buttonProps: {
    'aria-expanded': boolean;
    'aria-label': string;
    onMouseDown: (event: { stopPropagation: () => void }) => void;
    onClick: (event: { stopPropagation: () => void }) => void;
    onDoubleClick: (event: { stopPropagation: () => void }) => void;
  };
}

/** The chevron that expands a row: a group, a tree node or a master row. */
export function useRowToggle<TData extends RowData>(row: GridRow<TData>): RowToggleModel {
  const t = useTranslate(row.table);
  const { canExpand, expanded } = useGridSelector(row.table, () => ({
    canExpand: row.getCanExpand(),
    expanded: row.getIsExpanded(),
  }));

  return {
    canExpand,
    expanded,
    count: row.getLeafRows().length,
    buttonProps: {
      'aria-expanded': expanded,
      'aria-label': expanded ? t('rows.collapse') : t('rows.expand'),
      onMouseDown: (event) => event.stopPropagation(),
      onClick: (event) => {
        event.stopPropagation();
        row.toggleExpanded();
      },
      onDoubleClick: (event) => event.stopPropagation(),
    },
  };
}
