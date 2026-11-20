import type { RowData } from '@tanstack/react-table';

import type { GridCell, GridRow } from '#/core/types.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useFocusTarget } from '#/hooks/useFocusTarget.ts';
import { columnLabel } from '#/logic/columns/columnInfo.ts';
import { anchorOf } from '#/logic/selection/cellRanges.ts';

/** The cell of the column a group row groups by; render it with `FlexRender` to show the group's value. */
export function groupingCell<TData extends RowData>(row: GridRow<TData>): GridCell<TData> | undefined {
  return row.getAllCells().find((cell) => cell.column.id === row.groupingColumnId);
}

/**
 * The full-width cell of a group row (`groupDisplay: 'rows'`). It stands for every column it spans, so it is focused
 * whichever of them the focus is on.
 */
export function useGroupRowCell<TData extends RowData, TElement extends HTMLElement = HTMLTableCellElement>(
  row: GridRow<TData>
) {
  'use no memo';
  const focused = useGridSelector(row.table.atoms.cellSelection, (ranges) => anchorOf(ranges)?.rowId === row.id);
  const ref = useFocusTarget<TElement>(focused);
  const cell = groupingCell(row);

  return {
    cell,
    focused,
    /** The grouped column's name, shown before the value. */
    label: cell ? columnLabel(cell.column) : undefined,
    cellProps: {
      ref,
      tabIndex: focused ? 0 : -1,
      onMouseDown: () => {
        if (!focused && cell) row.table.setFocusedCell(row.id, cell.column.id);
      },
    },
  };
}
