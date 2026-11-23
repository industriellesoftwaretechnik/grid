import type { GroupDisplay } from '#/core/plugins/gridLayoutFeature.ts';

/** The values the grid falls back to where a table or column sets none. Sizes and toggles of the UI are the UI's. */
export const gridDefaults = {
  groupDisplay: 'columns' satisfies GroupDisplay,
  persist: false,
  column: { size: 120, minSize: 50, maxSize: 800 },
  /** Wait after the last keystroke in the search and filter inputs, and before the layout is persisted. */
  debounceMs: 300,
  /** Excel in German locales splits CSV at semicolons, and the formatted numbers there contain commas. */
  csvSeparator: ';',
} as const;
