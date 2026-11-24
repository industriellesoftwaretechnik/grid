import type { GroupDisplay } from '#/core/plugins/gridLayoutFeature.ts';

/** The defaults of `useGrid` and its columns, for UIs that need the same values. */
export const gridDefaults = {
  groupDisplay: 'columns' satisfies GroupDisplay,
  persist: false,
  /** Width limits of every column, in pixels. */
  column: { size: 120, minSize: 50, maxSize: 800 },
  /** For the search and filter inputs, and before the layout is persisted. */
  debounceMs: 300,
  /** Excel in German locales splits CSV at semicolons, and the formatted numbers there contain commas. */
  csvSeparator: ';',
} as const;
