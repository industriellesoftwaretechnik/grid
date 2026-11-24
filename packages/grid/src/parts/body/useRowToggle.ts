import type { RowData } from '@tanstack/react-table';

import type { GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface RowToggleModel {
  /** Whether the row has a toggle: a group, a tree node with children or a master row. */
  canExpand: boolean;
  expanded: boolean;
  /** The number of records in a group row. */
  count: number;
  /**
   * For the toggle button, which the UI names after `expanded`. Its presses stay on it: they neither focus nor select
   * the cell, start a range or an edit, nor reach the row's own click handlers.
   */
  buttonProps: {
    'aria-expanded': boolean;
    onMouseDown: (event: { stopPropagation: () => void }) => void;
    onClick: (event: { stopPropagation: () => void }) => void;
    onDoubleClick: (event: { stopPropagation: () => void }) => void;
  };
}

/** The chevron that expands a row: a group, a tree node or a master row. */
export function useRowToggle<TData extends RowData>(row: GridRow<TData>): RowToggleModel {
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
      onMouseDown: (event) => event.stopPropagation(),
      onClick: (event) => {
        event.stopPropagation();
        row.toggleExpanded();
      },
      onDoubleClick: (event) => event.stopPropagation(),
    },
  };
}
