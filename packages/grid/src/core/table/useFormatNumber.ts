import { localeFormats } from '#/core/columns/format.ts';
import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import type { GridMeta } from '#/core/table/gridMeta.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** Returns a function that formats a number like `formatNumber`, and re-renders when the table's locale changes. */
export function useFormatNumber(table: {
  gridStore: GridStore;
  options: { meta?: Partial<GridMeta> };
}): (value: number) => string {
  const locale = useGridSelector(table, () => table.options.meta?.locale);
  const { number } = localeFormats(locale);
  return (value) => number.format(value);
}
