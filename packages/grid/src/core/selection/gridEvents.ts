import type { KeyboardEvent } from 'react';

import type { RowData } from '@tanstack/react-table';

import { anchorOf, extendLatestRange, freeCornerOf } from '#/core/selection/cellRanges.ts';
import { clearCells, copyText, pasteText } from '#/core/selection/clipboard.ts';
import { displayedColumns, displayedRowIds, findCell, holdsRowToggle } from '#/core/selection/gridCells.ts';
import { keyToMove, moveFocus } from '#/core/selection/navigation.ts';
import { rowSelectionState } from '#/core/selection/rowSelectionState.ts';
import type { CoreTable } from '#/core/table/types.ts';

function isTextTarget(target: HTMLElement): boolean {
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

// Header buttons, filters and detail rows handle their own keys, so the grid acts only on keys pressed in a body cell.
function cellTarget(target: EventTarget): HTMLElement | undefined {
  if (!(target instanceof HTMLElement) || isTextTarget(target)) return undefined;
  if (target.closest('td') === null || target.closest('[data-row-detail]') !== null) return undefined;
  return target;
}

function hasTextSelection(): boolean {
  const selection = window.getSelection();
  return selection !== null && !selection.isCollapsed;
}

export function gridEvents<TData extends RowData>(table: CoreTable<TData>, pageSize: () => number) {
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = cellTarget(event.target);
    // While a cell is edited, its editor owns the keys, including those of custom editors without an input.
    if (!target || event.altKey || table.getEditingCell() !== null) return;
    const ranges = table.atoms.cellSelection.get();
    const focused = anchorOf(ranges);
    const move = keyToMove(event);
    if (move) {
      const extend = event.shiftKey && event.key !== 'Tab';
      const next = moveFocus(
        displayedRowIds(table),
        displayedColumns(table).map((column) => column.id),
        extend ? freeCornerOf(ranges) : focused,
        move,
        pageSize()
      );
      if (next) {
        event.preventDefault();
        if (extend) table.setCellSelection((current) => extendLatestRange(current, next));
        else table.setFocusedCell(next.rowId, next.columnId);
      }
      return;
    }

    const command = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (command && (key === 'y' || (key === 'z' && event.shiftKey))) {
      if (table.redoCellEdit()) event.preventDefault();
      return;
    }
    if (command && key === 'z') {
      if (table.undoCellEdit()) event.preventDefault();
      return;
    }
    if (command && key === 'a' && table.options.enableRowSelection !== false) {
      event.preventDefault();
      table.toggleAllRowsSelected(true);
      return;
    }

    // Keys on a checkbox or toggle inside the cell are theirs.
    if (target.tagName !== 'TD') return;
    const cell = findCell(table, focused);
    const row = focused ? table.getRowModel().rowsById[focused.rowId] : undefined;
    if (!row) return;
    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      const toggles = event.key === 'Enter' && cell !== undefined && holdsRowToggle(cell) && row.getCanExpand();
      if (row.getIsGrouped() || toggles) row.toggleExpanded();
      else cell?.startEditing();
    } else if (event.key === ' ') {
      event.preventDefault();
      if (row.getCanSelect()) row.toggleSelected(!rowSelectionState(row).checked);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      clearCells(table);
    } else if (event.key.length === 1 && !command && cell?.getCanEdit()) {
      event.preventDefault();
      cell.startEditing(event.key);
    }
  };

  return { onKeyDown };
}

// Browsers send copy and paste to the selection or the body, not the focused cell, so listen on the document.
export function listenToClipboard<TData extends RowData>(table: CoreTable<TData>, root: HTMLElement) {
  const inCell = () => {
    const active = document.activeElement;
    return active !== null && root.contains(active) && cellTarget(active) !== undefined;
  };
  const onCopy = (event: ClipboardEvent) => {
    if (!inCell() || hasTextSelection() || !event.clipboardData) return;
    const text = copyText(table);
    if (text === undefined) return;
    event.preventDefault();
    event.clipboardData.setData('text/plain', text);
  };
  const onPaste = (event: ClipboardEvent) => {
    if (!inCell() || table.atoms.cellSelection.get().length === 0 || !event.clipboardData) return;
    event.preventDefault();
    pasteText(table, event.clipboardData.getData('text/plain'));
  };
  document.addEventListener('copy', onCopy);
  document.addEventListener('paste', onPaste);
  return () => {
    document.removeEventListener('copy', onCopy);
    document.removeEventListener('paste', onPaste);
  };
}

function stopOnNativeTargets(event: MouseEvent) {
  if (
    event.target instanceof Element &&
    event.target.closest('a[href], input, textarea, select, [data-row-detail]') !== null
  ) {
    event.stopPropagation();
  }
}

// Links, inputs and detail rows keep the browser's menu: the event stops before a cell menu listening above the grid.
export function keepNativeContextMenu(root: HTMLElement) {
  root.addEventListener('contextmenu', stopOnNativeTargets);
  return () => root.removeEventListener('contextmenu', stopOnNativeTargets);
}
