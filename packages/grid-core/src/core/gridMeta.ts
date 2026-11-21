import type { ReactNode } from 'react';

import type { ColumnVisibilityState } from '@tanstack/react-table';

import type { GridComponents } from '#/core/components.ts';
import type { ServerRows } from '#/hooks/useServerRows.ts';
import type { Translate } from '#/locale/messages.ts';
import type { AggregationName } from '#/logic/grouping/aggregations.ts';

/**
 * `columns` shows a group in the cell of its grouped column, `groupColumn` in one extra column for all levels, and
 * `rows` gives each group a full-width row.
 */
export type GroupDisplay = 'columns' | 'groupColumn' | 'rows';

/** The state this package keeps beside TanStack's. */
export interface GridExtraState {
  /** The aggregation chosen in the column menu; `null` removes the one the column definition sets. */
  columnAggregation: Record<string, AggregationName | null>;
  /** Collapsed column groups by id. */
  collapsedColumnGroups: Record<string, boolean>;
}

/** What `useGrid` gives the components through `table.options.meta`. */
export interface GridMeta {
  /** The table's `id`; its DOM elements carry it as `data-table-id`. */
  tableId: string;
  /** The texts, from `useGrid`'s `messages`. */
  t: Translate;
  components: GridComponents;
  groupDisplay: GroupDisplay;
  /** Whether the rows come as a tree through `getSubRows`. */
  treeData: boolean;
  /**
   * The column whose cells hold the toggles of tree nodes and master rows; unset without either. The group column takes
   * them while it is shown, and the first shown data column while this one is hidden.
   */
  expandColumn: string | undefined;
  /** The detail of an expanded master row, by row id. */
  renderDetail: ((rowId: string) => ReactNode) | undefined;
  extraState: GridExtraState;
  /** The user's own choices; the table also hides the group column while ungrouped and columns of collapsed groups. */
  ownColumnVisibility: ColumnVisibilityState;
  /** Set when the rows come from `fetchRows`. */
  server: ServerRows | undefined;
  /** Like AG Grid, grouping from the UI hides the column, unless it holds the group toggles, and ungrouping shows it. */
  toggleRowGrouping: (columnId: string) => void;
  setColumnAggregation: (columnId: string, aggregation: AggregationName | null) => void;
  toggleColumnGroup: (groupId: string) => void;
  setColumnsVisible: (columnIds: string[], visible: boolean) => void;
  /** Returns column order, sizes, pinning, visibility, grouping and the extra state to the initial state. */
  resetLayout: () => void;
}

export function gridMeta(table: { options: { meta?: GridMeta } }): GridMeta {
  const { meta } = table.options;
  if (!meta) throw new Error('The grid components need a table from useGrid.');
  return meta;
}
