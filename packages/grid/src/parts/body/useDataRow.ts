import type { Ref } from 'react';

import type { RowData } from '@tanstack/react-table';

import { rowSelectionState } from '#/core/selection/rowSelectionState.ts';
import type { GridCell, GridRow } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import type { CellEvents } from '#/parts/body/useBodyCell.ts';
import { placeSlots, type LayoutSlot, type Placed } from '#/parts/view/layout.ts';

/** Options of `useDataRow`; it leaves the cell events to `useBodyCell`. */
export interface RowOptions<TData extends RowData> extends CellEvents<TData> {
  /** In px. */
  rowHeight: number;
  onRowClick?: (row: GridRow<TData>) => void;
  onRowDoubleClick?: (row: GridRow<TData>) => void;
}

/** Locked columns such as the checkbox keep their cell, one spans the rest. */
export interface FullWidthGroup<TData extends RowData> {
  kept: Placed<GridCell<TData>>[];
  colSpan: number;
  /** Where the label stays while the columns scroll sideways. */
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

/** The body row: its cells by region, or a full-width group row, and props for its element. */
export function useDataRow<TData extends RowData, TElement extends HTMLElement = HTMLTableRowElement>(
  row: GridRow<TData>,
  {
    rowHeight,
    onRowClick,
    onRowDoubleClick,
    index,
    measureRef,
  }: RowOptions<TData> & {
    /** The `VirtualRow`'s `index`. */
    index?: number;
    /** `useVirtualRows`'s `measureElement`. */
    measureRef?: Ref<TElement>;
  }
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
      startWidths:
        groupDisplay === 'rows' && grouped
          ? row.table.getStartVisibleLeafColumns().map((column) => column.getSize())
          : undefined,
    };
  });
  const slots = placeSlots(start, center, end);
  const groupRow = startWidths ? fullWidthGroup(slots, startWidths) : undefined;

  return {
    /** The row is selected; a group row is when all its selectable rows are. */
    selected,
    /** A group row. */
    grouped,
    /** `onRowClick` is given. */
    clickable: onRowClick !== undefined,
    /** Unset for a full-width group row; `'filler'` takes the spare width. */
    cells: groupRow ? undefined : slots,
    /** Set for a group row under `groupDisplay: 'rows'`, which spans the columns after its locked ones. */
    groupRow,
    /** Set for `groupDisplay: 'columns'`; for `useBodyCell`. */
    groupToggles,
    /** Props for the `<tr>` element. */
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

/** What `useDataRow` returns. */
export type DataRowModel = ReturnType<typeof useDataRow>;
