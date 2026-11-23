import type { ReactNode } from 'react';

/** The icon a built-in menu entry asks for; the UI maps it to its icon set. */
export type GridMenuIcon =
  | 'sort-asc'
  | 'sort-desc'
  | 'clear'
  | 'filter'
  | 'pin'
  | 'group'
  | 'aggregation'
  | 'hide'
  | 'columns'
  | 'reset'
  | 'copy'
  | 'paste';

export interface GridMenuItem {
  type: 'item';
  /** Unique in its menu; usable as key. */
  id: string;
  label: string;
  icon?: GridMenuIcon;
  /** An icon of the app's own, for items it adds. */
  iconNode?: ReactNode;
  /** A keyboard shortcut to show, such as `Ctrl+C`. */
  shortcut?: string;
  /** A short text shown at the end, such as an aggregation's symbol. */
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
  label: string;
  icon?: GridMenuIcon;
  sections: GridMenuSection[];
}

export type GridMenuEntry = GridMenuItem | GridSubmenu;

/** Entries that a menu separates from the next section. A menu has no empty sections. */
export interface GridMenuSection {
  id: string;
  entries: GridMenuEntry[];
}

export function menuItem(
  id: string,
  label: string,
  icon: GridMenuIcon | undefined,
  onSelect: () => void,
  extra: Partial<GridMenuItem> = {}
): GridMenuItem {
  return { type: 'item', id, label, icon, onSelect, ...extra };
}
