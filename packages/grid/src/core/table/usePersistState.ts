import { useEffect } from 'react';

import type { GridSnapshot, GridStore } from '#/core/plugins/gridStoreFeature.ts';
import { useDebouncedCallback } from '#/core/shared/useDebouncedCallback.ts';
import { gridDefaults } from '#/core/table/defaults.ts';
import { persistedSlices, writePersistedState } from '#/core/table/persistence.ts';

// The table's visibility includes the group column it hides itself; the user's own choices are what is kept.
function persistedJson({ state, ownColumnVisibility }: GridSnapshot): string {
  const values: Record<string, unknown> = { ...state, columnVisibility: ownColumnVisibility };
  return JSON.stringify(Object.fromEntries(persistedSlices.map((slice) => [slice, values[slice]])));
}

/** Writes once the layout settles; without a key nothing is stored. */
export function usePersistState(key: string | undefined, store: GridStore) {
  const save = useDebouncedCallback(
    (json: string) => {
      if (key !== undefined) writePersistedState(key, json);
    },
    gridDefaults.debounceMs,
    { flushOnUnmount: true }
  );

  useEffect(() => {
    if (key === undefined) return undefined;
    let last = persistedJson(store.get());
    const subscription = store.subscribe(() => {
      const json = persistedJson(store.get());
      if (json === last) return;
      last = json;
      save.run(json);
    });
    return () => subscription.unsubscribe();
  }, [key, store, save]);
}
