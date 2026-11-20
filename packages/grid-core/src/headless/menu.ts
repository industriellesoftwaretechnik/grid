import type { ReactNode } from 'react';

/** The built-in icons a menu entry names; a UI layer maps them to its icon set. */
export type MenuIcon =
  | 'sort-asc'
  | 'sort-desc'
  | 'clear'
  | 'filter'
  | 'pin'
  | 'group'
  | 'aggregation'
  | 'hide'
  | 'copy'
  | 'paste';

export interface MenuItem {
  type: 'item';
  /** Unique in its menu; usable as key. */
  id: string;
  label: string;
  icon?: MenuIcon;
  /** An icon of the app's own, for items it adds. */
  iconNode?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

/** A submenu of mutually exclusive options, such as a radio group. */
export interface MenuChoice {
  type: 'choice';
  id: string;
  label: string;
  icon?: MenuIcon;
  value: string;
  options: { value: string; label: string; hint?: string }[];
  onChange: (value: string) => void;
}

export type MenuEntry = MenuItem | MenuChoice;

/** Entries a UI layer separates from the next section. A menu has no empty sections. */
export interface MenuSection {
  id: string;
  entries: MenuEntry[];
}
