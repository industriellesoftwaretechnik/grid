import type { ReactNode } from 'react';

import type { AggregationName } from '#/core/table/aggregations.ts';

/** Ids of the grid's own menu entries; they carry no text or icon, so the UI names them and picks their icons by id. */
export type GridMenuId =
  | 'sort.asc'
  | 'sort.desc'
  | 'sort.clear'
  | 'filter'
  | 'filter.clear'
  | 'pin'
  | 'pin.start'
  | 'pin.end'
  | 'pin.none'
  | 'group.by'
  | 'group.remove'
  | 'aggregation'
  | 'aggregation.none'
  | `aggregation.${AggregationName}`
  | 'column.hide'
  | 'columns.reset'
  | 'copy'
  | 'copy.with-headers'
  | 'paste';

/** A menu entry that runs `onSelect`. */
export interface GridMenuItem {
  type: 'item';
  /** Unique in its menu; the grid's own entries use a `GridMenuId`. */
  id: string;
  /** Set only where the text is data, such as a column's name; otherwise the UI names the entry by `id`. */
  label?: string;
  icon?: ReactNode;
  /** The keyboard shortcut to show beside the entry; the grid's own entries leave it to the UI. */
  shortcut?: string;
  /** Secondary text to show beside the entry. */
  hint?: string;
  disabled?: boolean;
  /** Set only on items that can be on or off. */
  checked?: boolean;
  /** Keeps the menu open after the entry is selected, such as to toggle several columns. */
  keepOpen?: boolean;
  onSelect: () => void;
}

/** A menu entry that opens further sections. */
export interface GridSubmenu {
  type: 'submenu';
  /** Unique in its menu; the grid's own entries use a `GridMenuId`. */
  id: string;
  /** Set only where the text is data; otherwise the UI names the entry by `id`. */
  label?: string;
  icon?: ReactNode;
  sections: GridMenuSection[];
}

/** An entry of a menu section: an item or a submenu. */
export type GridMenuEntry = GridMenuItem | GridSubmenu;

/** A group of menu entries, set apart from the others; a menu has no empty sections. */
export interface GridMenuSection {
  id: string;
  entries: GridMenuEntry[];
}

export function menuItem(
  id: GridMenuId,
  onSelect: () => void,
  extra: Partial<Omit<GridMenuItem, 'type' | 'id' | 'onSelect'>> = {}
): GridMenuItem {
  return { type: 'item', id, onSelect, ...extra };
}
