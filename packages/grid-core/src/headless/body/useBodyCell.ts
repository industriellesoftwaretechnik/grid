import type { CSSProperties, MouseEvent, RefObject } from 'react';

import type { RowData } from '@tanstack/react-table';

import { groupColumnId } from '#/columns/groupColumn.tsx';
import { gridMeta } from '#/core/gridMeta.ts';
import type { GridCell } from '#/core/types.ts';
import { groupingCell } from '#/headless/body/useGroupRowCell.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import { useFocusTarget } from '#/hooks/useFocusTarget.ts';
import { columnMeta } from '#/logic/columns/columnInfo.ts';
import type { ColumnAlign } from '#/logic/columns/columnMeta.ts';
import { holdsRowToggle } from '#/logic/focus/gridCells.ts';
import { formatValue } from '#/logic/format.ts';
import { cellStickyStyle, type Region } from '#/logic/layout.ts';
import { singleBlock } from '#/logic/selection/cellRanges.ts';
import { extendFillDrag, startFillDrag } from '#/logic/selection/fillDrag.ts';

export interface CellEvents<TData extends RowData> {
  onCellClick?: (cell: GridCell<TData>, event: MouseEvent) => void;
  /** Called before a double click starts editing; `event.preventDefault()` keeps it from doing so. */
  onCellDoubleClick?: (cell: GridCell<TData>, event: MouseEvent) => void;
}

/** How the focus and the cell ranges show on a cell. A range is drawn only when it spans more than one cell. */
export interface CellLook {
  focused: boolean;
  inRange: boolean;
  /** The sides of the cell on the edge of a range. */
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  /** Whether the cell shows the handle that fills the range downwards or sideways. */
  fillHandle: boolean;
}

/**
 * What a body cell shows: `editor` while it is edited, `group` for the cell holding its group's toggle and count,
 * `toggle` for the cell holding a tree node's or master row's toggle, `empty` for data columns of a group row that
 * neither group nor aggregate, `value` otherwise. Each but `editor` and `empty` renders `shownCell`.
 */
export type BodyCellContent = 'editor' | 'group' | 'toggle' | 'empty' | 'value';

export interface BodyCellOptions<TData extends RowData> extends CellEvents<TData> {
  region: Region;
  index: number;
  /** Whether the cells of grouped columns hold their group's toggle (`groupDisplay: 'columns'`). */
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
  target instanceof Element && target.closest('a[href], button, input, label, select, textarea') !== null;

/** A body cell: its focus, range and editing state, what it shows, and the props for its element. */
export function useBodyCell<TData extends RowData, TElement extends HTMLElement = HTMLTableCellElement>(
  cell: GridCell<TData>,
  { region, index, groupToggles, onCellClick, onCellDoubleClick }: BodyCellOptions<TData>
) {
  'use no memo';
  const { table } = cell;
  const look = useGridSelector(table.atoms.cellSelection, () => cellLook(cell));
  const editing = useGridSelector(table.atoms.editingCell, () => cell.getIsEditing());
  const ref: RefObject<TElement | null> = useFocusTarget<TElement>(look.focused && !editing);
  const meta = columnMeta(cell.column);
  const inGroupColumn = cell.column.id === groupColumnId;
  const groupCell = inGroupColumn && cell.row.getIsGrouped() ? groupingCell(cell.row) : undefined;
  const grouped = (groupToggles && cell.getIsGrouped()) || groupCell !== undefined;
  const toggle = holdsRowToggle(cell);
  const empty = cell.row.getIsGrouped() && !grouped && !cell.getIsAggregated() && cell.column.accessorFn !== undefined;
  const value = empty ? undefined : cell.getValue();
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
        ? formatValue(value, cell.column)
        : meta.tooltip(value, rowData);

  const onMouseDown = (event: MouseEvent<TElement>) => {
    if (editing) return;
    if (event.button === 0 && !isControl(event.target) && cell.getCanSelect()) {
      // Keeps the browser from selecting text while a range is dragged; the cell takes focus itself.
      event.preventDefault();
      cell.getSelectionStartHandler()(event);
      event.currentTarget.focus({ preventScroll: true });
    } else if (event.button === 0 || !look.inRange) {
      table.setFocusedCell(cell.row.id, cell.column.id);
    }
  };

  return {
    look,
    content,
    /** The cell to render with `FlexRender`: in the group column, a group row shows the cell of its grouped column. */
    shownCell: groupCell ?? cell,
    align,
    /** The indentation of the toggle, in levels. */
    toggleLevel: grouped || inGroupColumn || gridMeta(table).treeData ? cell.row.depth : 0,
    /** The column's `cellClassName` for this cell. */
    className: typeof meta.cellClassName === 'function' ? meta.cellClassName(value, rowData) : meta.cellClassName,
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
    /** For the fill handle's element, shown where `look.fillHandle` is set and the cell is not edited. */
    fillHandleProps: {
      onMouseDown: (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        startFillDrag(table);
      },
    },
  };
}
