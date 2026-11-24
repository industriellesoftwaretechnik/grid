import type { CSSProperties, MouseEvent, RefObject } from 'react';

import type { RowData } from '@tanstack/react-table';

import { columnMeta } from '#/core/columns/columnInfo.ts';
import type { ColumnAlign } from '#/core/columns/columnMeta.ts';
import { formatValue } from '#/core/columns/format.ts';
import { groupColumnId } from '#/core/columns/groupColumn.ts';
import { singleBlock } from '#/core/selection/cellRanges.ts';
import { extendFillDrag, startFillDrag } from '#/core/selection/fillDrag.ts';
import { holdsRowToggle } from '#/core/selection/gridCells.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { GridCell } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';
import { groupingCell } from '#/parts/body/useGroupRowCell.ts';
import { cellStickyStyle, type Region } from '#/parts/view/layout.ts';
import { useFocusTarget } from '#/parts/view/useFocusTarget.ts';

/** Handlers for clicks on body cells. */
export interface CellEvents<TData extends RowData> {
  onCellClick?: (cell: GridCell<TData>, event: MouseEvent) => void;
  /** Called before a double click starts editing; `event.preventDefault()` keeps it from doing so. */
  onCellDoubleClick?: (cell: GridCell<TData>, event: MouseEvent) => void;
}

/** How a body cell is drawn in the selection; a range is drawn only when it spans more than one cell. */
export interface CellLook {
  focused: boolean;
  inRange: boolean;
  /** The sides of the cell on the edge of a range. */
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  /** The bottom-right cell of the only range, where the cell can be selected and edited. */
  fillHandle: boolean;
}

/**
 * What a body cell shows: `group` a group's value with its toggle, `toggle` a tree or master row's toggle, `empty` a
 * group row's cell that neither groups nor aggregates. All but `editor` and `empty` render `shownCell`.
 */
export type BodyCellContent = 'editor' | 'group' | 'toggle' | 'empty' | 'value';

/** Options of `useBodyCell`. */
export interface BodyCellOptions<TData extends RowData> extends CellEvents<TData> {
  /** The `region` of the cell's slot in `useDataRow`'s `cells`. */
  region: Region;
  /** The `index` of the cell's slot in `useDataRow`'s `cells`, within its region. */
  index: number;
  /** `useDataRow`'s `groupToggles`. */
  groupToggles: boolean;
}

function cellLook<TData extends RowData>(cell: GridCell<TData>): CellLook {
  const { table } = cell;
  const bounds = table.getCellSelectionBounds();
  const [only] = bounds;
  const drawn = bounds.length > 1 || singleBlock(bounds) !== undefined;
  const edges = drawn ? cell.getSelectionEdges() : { top: false, right: false, bottom: false, left: false };
  const fillHandle =
    bounds.length === 1 &&
    only?.maxRowIndex === cell.row.getDisplayIndex() &&
    only.maxColumnIndex === table.getCellSelectionColumnIndexes()[cell.column.id] &&
    cell.getCanSelect() &&
    cell.getCanEdit();
  return { focused: cell.getIsFocused(), inRange: drawn && cell.getIsSelected(), ...edges, fillHandle };
}

// Links, inputs and buttons in a cell keep their own mouse handling; they only focus the cell.
const isControl = (target: EventTarget) =>
  target instanceof Element &&
  target.closest('a[href], button, input, label, select, textarea, [role=checkbox]') !== null;

/** The body cell: its content, selection look and tooltip, and props for its element and fill handle. */
export function useBodyCell<TData extends RowData, TElement extends HTMLElement = HTMLTableCellElement>(
  cell: GridCell<TData>,
  { region, index, groupToggles, onCellClick, onCellDoubleClick }: BodyCellOptions<TData>
) {
  const { table } = cell;
  const inGroupColumn = cell.column.id === groupColumnId;
  const { look, editing, groupCell, grouped, toggle, empty, value, treeData, aggregation, valueText } = useGridSelector(
    table,
    () => {
      const groupRow = cell.row.getIsGrouped();
      const ofGroup = inGroupColumn && groupRow ? groupingCell(cell.row) : undefined;
      const holdsGroup = (groupToggles && cell.getIsGrouped()) || ofGroup !== undefined;
      const blank = groupRow && !holdsGroup && !cell.getIsAggregated() && cell.column.accessorFn !== undefined;
      return {
        look: cellLook(cell),
        editing: cell.getIsEditing(),
        groupCell: ofGroup,
        grouped: holdsGroup,
        toggle: holdsRowToggle(cell),
        empty: blank,
        value: blank ? undefined : cell.getValue(),
        treeData: gridMeta(table).treeData,
        aggregation: cell.getIsAggregated() ? cell.column.getAggregation() : undefined,
        // Read here, so a change of `useGrid`'s locale reaches the tooltip.
        valueText:
          blank || cell.column.columnDef.meta?.tooltip !== true ? undefined : formatValue(cell.getValue(), cell.column),
      };
    }
  );
  const ref: RefObject<TElement | null> = useFocusTarget<TElement>(look.focused && !editing);
  const meta = columnMeta(cell.column);
  const rowData = cell.row.original;
  const content: BodyCellContent = editing
    ? 'editor'
    : grouped
      ? 'group'
      : toggle
        ? 'toggle'
        : empty
          ? 'empty'
          : 'value';
  const align: ColumnAlign = grouped || toggle ? 'start' : meta.align;
  const tooltip =
    empty || meta.tooltip === undefined || meta.tooltip === false
      ? undefined
      : meta.tooltip === true
        ? valueText
        : meta.tooltip(value, rowData);

  const onMouseDown = (event: MouseEvent<TElement>) => {
    if (cell.getIsEditing()) return;
    if (event.button === 0 && !isControl(event.target) && cell.getCanSelect()) {
      // Keeps the browser from selecting text while a range is dragged.
      event.preventDefault();
      cell.getSelectionStartHandler()(event);
      event.currentTarget.focus({ preventScroll: true });
    } else if (event.button === 0 || !cellLook(cell).inRange) {
      table.setFocusedCell(cell.row.id, cell.column.id);
    }
  };

  return {
    look,
    content,
    /** In the group column, a group row shows the cell of its grouped column. */
    shownCell: groupCell ?? cell,
    align,
    /** Set for an aggregated value in a group row, to mark it by, such as Σ for a sum. */
    aggregation,
    /** How far to indent the toggle, in levels. */
    toggleLevel: grouped || inGroupColumn || treeData ? cell.row.depth : 0,
    /** The column's `meta.cellClassName` for this cell. */
    className: typeof meta.cellClassName === 'function' ? meta.cellClassName(value, rowData) : meta.cellClassName,
    /** Props for the `<td>` element; its `title` is the tooltip. */
    cellProps: {
      ref,
      tabIndex: look.focused ? 0 : -1,
      title: tooltip,
      onMouseDown,
      onMouseEnter: (event: MouseEvent<TElement>) => {
        if (!extendFillDrag(cell)) cell.getSelectionExtendHandler()(event);
      },
      onClick: onCellClick && ((event: MouseEvent<TElement>) => onCellClick(cell, event)),
      onDoubleClick: (event: MouseEvent<TElement>) => {
        onCellDoubleClick?.(cell, event);
        if (!event.defaultPrevented) cell.startEditing();
      },
      style: cellStickyStyle(region, index) satisfies CSSProperties | undefined,
    },
    /** Props for the fill handle, shown where `look.fillHandle` is set and the cell is not edited. */
    fillHandleProps: {
      'aria-hidden': true as const,
      onMouseDown: (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        startFillDrag(table);
      },
    },
  };
}

/** What `useBodyCell` returns. */
export type BodyCellModel = ReturnType<typeof useBodyCell>;
