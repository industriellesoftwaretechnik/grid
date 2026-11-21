import { gridMeta, type GridMeta } from '#/core/gridMeta.ts';
import { useGridSelector } from '#/headless/useGridSelector.ts';
import type { Translate } from '#/locale/messages.ts';
import type { GridStore } from '#/plugins/gridStoreFeature.ts';

/** The grid's texts, current when `useGrid`'s `messages` change. */
export function useTranslate(table: { gridStore: GridStore; options: { meta?: GridMeta } }): Translate {
  return useGridSelector(table, () => gridMeta(table).t);
}
