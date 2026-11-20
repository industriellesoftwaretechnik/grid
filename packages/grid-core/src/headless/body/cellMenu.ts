import type { ReactNode } from 'react';

import type { RowData } from '@tanstack/react-table';

import { gridMeta } from '#/core/gridMeta.ts';
import type { CoreTable, GridCell } from '#/core/types.ts';
import type { MenuEntry, MenuSection } from '#/headless/menu.ts';
import { copyText, pasteText } from '#/logic/clipboard/clipboard.ts';
import { findCell, focusedPosition, selectedBlock, selectedLeafRows } from '#/logic/focus/gridCells.ts';

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

/**
 * The context menu of the body; it acts on the range or the focused cell, which a right click focuses first. Build it
 * when the menu opens, so it reads the focus and the selection of that moment.
 */
export function cellMenu<TData extends RowData>(table: CoreTable<TData>, items?: CellMenuItems<TData>): MenuSection[] {
  const { t } = gridMeta(table);
  const cell = findCell(table, focusedPosition(table));
  const canCopy = cell !== undefined || selectedLeafRows(table).length > 0 || selectedBlock(table) !== undefined;
  const custom = cell ? (items?.(cell) ?? []) : [];
  const sections: MenuSection[] = [
    {
      id: 'clipboard',
      entries: [
        {
          type: 'item',
          id: 'copy',
          label: t('copy'),
          icon: 'copy',
          shortcut: 'Ctrl+C',
          disabled: !canCopy,
          onSelect: () => writeClipboard(copyText(table)),
        },
        {
          type: 'item',
          id: 'copy.with-headers',
          label: t('copy.with-headers'),
          icon: 'copy',
          disabled: !canCopy,
          onSelect: () => writeClipboard(copyText(table, true)),
        },
        {
          type: 'item',
          id: 'paste',
          label: t('paste'),
          icon: 'paste',
          shortcut: 'Ctrl+V',
          disabled: cell?.getCanEdit() !== true,
          onSelect: () => {
            void navigator.clipboard.readText().then((text) => pasteText(table, text));
          },
        },
      ],
    },
  ];
  for (const item of custom) {
    const entry: MenuEntry = {
      type: 'item',
      id: item.label,
      label: item.label,
      iconNode: item.icon,
      disabled: item.disabled,
      onSelect: item.onSelect,
    };
    const last = sections.at(-1);
    if (sections.length === 1 || item.separatorBefore || !last) sections.push({ id: item.label, entries: [entry] });
    else last.entries.push(entry);
  }
  return sections;
}
