import type { RowData } from '@tanstack/react-table';

import type { GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** What `useRowToggle` returns. */
export interface RowToggleModel {
  canExpand: boolean;
  expanded: boolean;
  /** The rows below this one, without the group rows nested in a group. */
  count: number;
  /** Props for the button; its presses neither focus, select or edit the cell nor reach the row's handlers. */
  buttonProps: {
    'aria-expanded': boolean;
    onMouseDown: (event: { stopPropagation: () => void }) => void;
    onClick: (event: { stopPropagation: () => void }) => void;
    onDoubleClick: (event: { stopPropagation: () => void }) => void;
  };
}

// `getLeafRows` also returns the group rows nested in a group.
export function rowCount<TData extends RowData>(row: GridRow<TData>): number {
  return row.getLeafRows().filter((leaf) => !leaf.getIsGrouped()).length;
}

/** The expand toggle of a group, tree or master row. */
export function useRowToggle<TData extends RowData>(row: GridRow<TData>): RowToggleModel {
  const { canExpand, expanded, count } = useGridSelector(row.table, () => ({
    canExpand: row.getCanExpand(),
    expanded: row.getIsExpanded(),
    count: rowCount(row),
  }));

  return {
    canExpand,
    expanded,
    count,
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
