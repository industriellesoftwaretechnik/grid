import type { ReactNode } from 'react';

import type { ColumnVisibilityState } from '@tanstack/react-table';

/** The values `useGrid` puts in the table's `meta`; the grid's actions are table methods. */
export interface GridMeta {
  /** The `id` option; DOM elements carry it as `data-table-id`. */
  tableId: string;
  /** `undefined` is the browser's locale. */
  locale: string | undefined;
  /** `true` when `getSubRows` is given. */
  treeData: boolean;
  /** `undefined` without tree data or `renderDetail`; a shown group column takes the toggles instead. */
  expandColumn: string | undefined;
  /** Renders the detail of the row with this id; `undefined` without the `renderDetail` option. */
  renderDetail: ((rowId: string) => ReactNode) | undefined;
  /** The user's choices, without the columns the table hides itself, such as the group column while ungrouped. */
  ownColumnVisibility: ColumnVisibilityState;
}

/** Returns the `GridMeta` of a table from `useGrid`; throws for any other table. */
export function gridMeta(table: { options: { meta?: GridMeta } }): GridMeta {
  const { meta } = table.options;
  if (!meta) throw new Error('The grid components need a table from useGrid.');
  return meta;
}
