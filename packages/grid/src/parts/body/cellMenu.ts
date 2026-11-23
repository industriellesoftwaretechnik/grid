import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';

import { copyText, pasteText } from '#/core/selection/clipboard.ts';
import { findCell, focusedPosition, selectedBlock, selectedLeafRows } from '#/core/selection/gridCells.ts';
import { menuItem, type GridMenuSection } from '#/core/shared/menu.ts';
import { gridMeta } from '#/core/table/gridMeta.ts';
import type { CoreTable, GridCell } from '#/core/table/types.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

export interface CellMenuItem {
  /** Also the item's key, so it is unique in the menu. */
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  separatorBefore?: boolean;
}

/** Items added below copy and paste in a cell's context menu. */
export type CellMenuItems<TData extends RowData> = (cell: GridCell<TData>) => CellMenuItem[];

const writeClipboard = (text: string | undefined) => {
  if (text !== undefined) void navigator.clipboard.writeText(text);
};

/** Copy, copy with headers and paste, for the range or the focused cell. */
export function clipboardMenu<TData extends RowData>(table: CoreTable<TData>): GridMenuSection {
  const { t } = gridMeta(table);
  const cell = findCell(table, focusedPosition(table));
  const canCopy = cell !== undefined || selectedLeafRows(table).length > 0 || selectedBlock(table) !== undefined;
  return {
    id: 'clipboard',
    entries: [
      menuItem('copy', t('copy'), 'copy', () => writeClipboard(copyText(table)), {
        shortcut: 'Ctrl+C',
        disabled: !canCopy,
      }),
      menuItem('copy.with-headers', t('copy.with-headers'), 'copy', () => writeClipboard(copyText(table, true)), {
        disabled: !canCopy,
      }),
      menuItem(
        'paste',
        t('paste'),
        'paste',
        () => void navigator.clipboard.readText().then((text) => pasteText(table, text)),
        { shortcut: 'Ctrl+V', disabled: cell?.getCanEdit() !== true }
      ),
    ],
  };
}

function withCustomItems(sections: GridMenuSection[], custom: CellMenuItem[]): GridMenuSection[] {
  const result = [...sections];
  for (const item of custom) {
    const entry = menuItem(item.label, item.label, undefined, item.onSelect, {
      iconNode: item.icon,
      disabled: item.disabled,
    });
    const last = result.at(-1);
    if (result.length === sections.length || item.separatorBefore || !last) {
      result.push({ id: item.label, entries: [entry] });
    } else {
      result[result.length - 1] = { ...last, entries: [...last.entries, entry] };
    }
  }
  return result;
}

/**
 * The context menu of the body as data for a UI adapter's `Menu`; it acts on the range or the focused cell, which a
 * right click focuses first. `items` adds the app's own items for the focused cell.
 */
export function useCellMenu<TData extends RowData>(
  table: CoreTable<TData>,
  items?: CellMenuItems<TData>
): GridMenuSection[] {
  const { clipboard, cell } = useGridSelector(table, () => ({
    clipboard: clipboardMenu(table),
    cell: findCell(table, focusedPosition(table)),
  }));
  const custom = cell && items ? items(cell) : [];
  return withCustomItems([clipboard], custom);
}
