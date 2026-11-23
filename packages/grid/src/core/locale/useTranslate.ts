import type { Translate } from '#/core/locale/messages.ts';
import type { GridStore } from '#/core/plugins/gridStoreFeature.ts';
import { gridMeta, type GridMeta } from '#/core/table/gridMeta.ts';
import { useGridSelector } from '#/core/table/useGridSelector.ts';

/** The grid's texts, current when `useGrid`'s `messages` change. */
export function useTranslate(table: { gridStore: GridStore; options: { meta?: GridMeta } }): Translate {
  return useGridSelector(table, () => gridMeta(table).t);
}
