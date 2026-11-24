import type { RowData } from '@tanstack/react-table';

import { columnLabel } from '#/core/columns/columnInfo.ts';
import { anchorOf } from '#/core/selection/cellRanges.ts';
import type { GridCell, GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { useFocusTarget } from '#/parts/view/useFocusTarget.ts';

export function groupingCell<TData extends RowData>(row: GridRow<TData>): GridCell<TData> | undefined {
  return row.getAllCells().find((cell) => cell.column.id === row.groupingColumnId);
}

/**
 * The full-width cell of a group row: its grouped cell and label, and props for its element. It stands for every
 * column it spans, so it is focused whichever of them the focus is on.
 */
export function useGroupRowCell<TData extends RowData, TElement extends HTMLElement = HTMLTableCellElement>(
  row: GridRow<TData>
) {
  const focused = useGridSelector(row.table, () => anchorOf(row.table.atoms.cellSelection.get())?.rowId === row.id);
  const ref = useFocusTarget<TElement>(focused);
  const cell = groupingCell(row);

  return {
    /** The cell of the column the row groups by. */
    cell,
    focused,
    /** The label of the column the row groups by. */
    label: cell ? columnLabel(cell.column) : undefined,
    /** Props for the `<td>` element. */
    cellProps: {
      ref,
      tabIndex: focused ? 0 : -1,
      onMouseDown: () => {
        if (!focused && cell) row.table.setFocusedCell(row.id, cell.column.id);
      },
    },
  };
}

/** What `useGroupRowCell` returns. */
export type GroupRowCellModel = ReturnType<typeof useGroupRowCell>;
