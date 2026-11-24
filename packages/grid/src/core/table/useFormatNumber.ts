import { localeFormats } from '#/core/columns/format.ts';
import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/**
 * Writes numbers as the grid's locale does, with at most two decimals, as cells and totals show them: for the numbers
 * of `useStatusBar`. It follows a change of `useGrid`'s `locale`.
 */
export function useFormatNumber(table: {
  gridStore: GridStore;
  options: { meta?: Partial<GridMeta> };
}): (value: number) => string {
  const locale = useGridSelector(table, () => table.options.meta?.locale);
  const { number } = localeFormats(locale);
  return (value) => number.format(value);
}
