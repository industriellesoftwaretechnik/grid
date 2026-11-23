import type { GroupDisplay } from '#/plugins/gridLayoutFeature.ts';

/** The values the table falls back to where a table, column or component sets none. */
export const gridDefaults = {
  groupDisplay: 'columns' satisfies GroupDisplay,
  persist: false,
  headerHeight: 36,
  rowHeight: 32,
  /** Rows rendered beyond each edge of the viewport. */
  overscan: 10,
  /** Rows per request when they come from `fetchRows`. */
  blockSize: 100,
  showTotals: false,
  /** The row above the header that columns are dragged into to group by them. */
  showGroupPanel: true,
  /** The row under the header with a filter per column. */
  showFloatingFilters: false,
  /** The tabs at the right edge that open the columns and the filters. */
  showSideBar: true,
  /** The footer with the row counts. */
  showStatusBar: true,
  column: { size: 120, minSize: 50, maxSize: 800 },
  /** Wait after the last keystroke in the search and filter inputs, and before the layout is persisted. */
  debounceMs: 300,
  /** Pixels a press must move to start dragging a column, so a click on a header still sorts. */
  dragDistance: 5,
  /** Excel in German locales splits CSV at semicolons, and the formatted numbers there contain commas. */
  csvSeparator: ';',
} as const;
