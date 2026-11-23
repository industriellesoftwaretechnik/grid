import { useEffect } from 'react';

import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';

import { gridDefaults } from '#/defaults.ts';
import { persistedSlices, writePersistedState } from '#/logic/state/persistence.ts';
import type { GridSnapshot, GridStore } from '#/plugins/gridStoreFeature.ts';

// The table's visibility includes the columns it hides itself; the user's own choices are what is kept.
function persistedJson({ state, ownColumnVisibility }: GridSnapshot): string {
  const values: Record<string, unknown> = { ...state, columnVisibility: ownColumnVisibility };
  return JSON.stringify(Object.fromEntries(persistedSlices.map((slice) => [slice, values[slice]])));
}

/** Writes the layout under `key` once it settles, without rendering anything; without a key nothing is stored. */
export function usePersistState(key: string | undefined, store: GridStore) {
  const save = useDebouncedCallback((json: string) => key !== undefined && writePersistedState(key, json), {
    wait: gridDefaults.debounceMs,
  });

  useEffect(() => {
    if (key === undefined) return undefined;
    let last = persistedJson(store.get());
    const subscription = store.subscribe(() => {
      const json = persistedJson(store.get());
      if (json === last) return;
      last = json;
      save(json);
    });
    return () => subscription.unsubscribe();
  }, [key, store, save]);
}
