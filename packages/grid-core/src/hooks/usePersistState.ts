import { useEffect } from 'react';

import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';

import { gridDefaults } from '#/defaults.ts';
import { writePersistedState, type PersistedState } from '#/logic/state/persistence.ts';

/** Writes the state under `key` once it settles; without a key nothing is stored. */
export function usePersistState(key: string | undefined, state: PersistedState) {
  const json = key === undefined ? undefined : JSON.stringify(state);
  const save = useDebouncedCallback((value: string) => key !== undefined && writePersistedState(key, value), {
    wait: gridDefaults.debounceMs,
  });

  useEffect(() => {
    if (json !== undefined) save(json);
  }, [json, save]);
}
