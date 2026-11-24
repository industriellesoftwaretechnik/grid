import type { ReactNode } from 'react';

import type { AggregationName } from '#/core/table/aggregations.ts';

/**
 * The ids of the grid's own menu entries. They carry no text or icon: the UI names them and picks their icons by id,
 * which also lets it leave entries out or reorder them.
 */
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

export interface GridMenuItem {
  type: 'item';
  /** Unique in its menu; usable as key. The grid's own entries use a `GridMenuId`. */
  id: string;
  /** Set where the text is data, such as a column's name, and on the app's own entries; else named by `id`. */
  label?: string;
  /** The app's own entries' icon. */
  icon?: ReactNode;
  /** A keyboard shortcut to show, for the app's own entries. */
  shortcut?: string;
  /** A short text shown at the end, for the app's own entries. */
  hint?: string;
  disabled?: boolean;
  /** Set for an item that is on or off, such as one of several options; shown checked when true. */
  checked?: boolean;
  /** Keeps the menu open after selecting, as when showing and hiding columns. */
  keepOpen?: boolean;
  onSelect: () => void;
}

export interface GridSubmenu {
  type: 'submenu';
  id: string;
  label?: string;
  icon?: ReactNode;
  sections: GridMenuSection[];
}

export type GridMenuEntry = GridMenuItem | GridSubmenu;

/**
 * Entries that a menu separates from the next section. A menu has no empty sections. Menus are plain data: map,
 * filter or extend them before rendering to change what they offer.
 */
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
