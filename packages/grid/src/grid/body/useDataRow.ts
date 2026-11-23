import type { Ref } from 'react';

import type { RowData } from '@tanstack/react-table';

import type { GridCell, GridRow } from '#/core/types.ts';
import type { CellEvents } from '#/grid/body/useBodyCell.ts';
import { useGridSelector } from '#/hooks/useGridSelector.ts';
import { placeSlots, type LayoutSlot, type Placed } from '#/logic/layout.ts';
import { rowSelectionState } from '#/logic/selection/rowSelectionState.ts';

export interface RowOptions<TData extends RowData> extends CellEvents<TData> {
  rowHeight: number;
  onRowClick?: (row: GridRow<TData>) => void;
  onRowDoubleClick?: (row: GridRow<TData>) => void;
}

/** A group row of `groupDisplay: 'rows'`: locked columns such as the checkbox keep their cell, one spans the rest. */
export interface FullWidthGroup<TData extends RowData> {
  kept: Placed<GridCell<TData>>[];
  colSpan: number;
  /** Where the label stays while the columns scroll sideways, past the pinned kept cells. */
  stickyLeft: number;
}

function fullWidthGroup<TData extends RowData>(
  slots: LayoutSlot<GridCell<TData>>[],
  startWidths: number[]
): FullWidthGroup<TData> {
  const kept: Placed<GridCell<TData>>[] = [];
  for (const slot of slots) {
    if (slot === 'filler' || !slot.item.column.columnDef.meta?.lockPosition) break;
    kept.push(slot);
  }
  const stickyLeft = kept
    .filter((slot) => slot.region === 'start')
    .reduce((width, slot) => width + (startWidths[slot.index] ?? 0), 0);
  return { kept, colSpan: slots.length - kept.length, stickyLeft };
}

/**
 * A body row: whether it is selected, its cells in display order (`'filler'` takes the spare width), or for a group
 * row of `groupDisplay: 'rows'` its full-width layout, and the props for its element.
 */
export function useDataRow<TData extends RowData, TElement extends HTMLElement = HTMLTableRowElement>(
  row: GridRow<TData>,
  {
    rowHeight,
    onRowClick,
    onRowDoubleClick,
    index,
    measureRef,
  }: RowOptions<TData> & { index?: number; measureRef?: Ref<TElement> }
) {
  const grouped = row.getIsGrouped();
  const { selected, groupToggles, start, center, end, startWidths } = useGridSelector(row.table, () => {
    const { groupDisplay } = row.table.options;
    return {
      selected: rowSelectionState(row).checked,
      groupToggles: groupDisplay === 'columns',
      start: row.getStartVisibleCells(),
      center: row.getCenterVisibleCells(),
      end: row.getEndVisibleCells(),
      // Set for a full-width group row, whose label keeps clear of the pinned cells it keeps.
      startWidths:
        groupDisplay === 'rows' && grouped
          ? row.table.getStartVisibleLeafColumns().map((column) => column.getSize())
          : undefined,
    };
  });
  const slots = placeSlots(start, center, end);
  const groupRow = startWidths ? fullWidthGroup(slots, startWidths) : undefined;

  return {
    selected,
    grouped,
    clickable: onRowClick !== undefined,
    /** Unset for a full-width group row. */
    cells: groupRow ? undefined : slots,
    groupRow,
    /** Whether the cells of grouped columns hold their group's toggle. */
    groupToggles,
    rowProps: {
      'data-index': index,
      ref: measureRef,
      'data-state': selected ? 'selected' : undefined,
      style: { height: rowHeight },
      onClick: onRowClick && (() => onRowClick(row)),
      onDoubleClick: onRowDoubleClick && (() => onRowDoubleClick(row)),
    },
  };
}
