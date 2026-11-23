import type { ReactNode } from 'react';

import type { ColumnVisibilityState } from '@tanstack/react-table';

import type { Translate } from '#/core/locale/messages.ts';

/** The values `useGrid` gives the components through `table.options.meta`; the grid's actions are table APIs. */
export interface GridMeta {
  /** The table's `id`; its DOM elements carry it as `data-table-id`. */
  tableId: string;
  /** The texts, from `useGrid`'s `messages`. */
  t: Translate;
  /** Whether the rows come as a tree through `getSubRows`. */
  treeData: boolean;
  /**
   * The column whose cells hold the toggles of tree nodes and master rows; unset without either. The group column takes
   * them while it is shown, and the first shown data column while this one is hidden.
   */
  expandColumn: string | undefined;
  /** The detail of an expanded master row, by row id. */
  renderDetail: ((rowId: string) => ReactNode) | undefined;
  /** The user's own choices; the table also hides the group column while ungrouped and columns of collapsed groups. */
  ownColumnVisibility: ColumnVisibilityState;
}

export function gridMeta(table: { options: { meta?: GridMeta } }): GridMeta {
  const { meta } = table.options;
  if (!meta) throw new Error('The grid components need a table from useGrid.');
  return meta;
}
