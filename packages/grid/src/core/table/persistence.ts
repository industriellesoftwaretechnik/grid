import type { GridState } from '#/core/table/types.ts';

/** The state slices the `persist` option keeps in localStorage. */
export const persistedSlices = [
  'columnOrder',
  'columnSizing',
  'columnPinning',
  'columnVisibility',
  'sorting',
  'grouping',
  'columnAggregation',
] as const satisfies readonly (keyof GridState)[];

export type PersistedState = Pick<GridState, (typeof persistedSlices)[number]>;

export function parsePersistedState(json: string | null): Partial<PersistedState> {
  try {
    const parsed: unknown = JSON.parse(json ?? 'null');
    if (typeof parsed !== 'object' || parsed === null) return {};
    const state: Partial<PersistedState> = {};
    for (const slice of persistedSlices) {
      if (!(slice in parsed)) continue;
      const value: unknown = Reflect.get(parsed, slice);
      Object.assign(state, { [slice]: value });
    }
    return state;
  } catch {
    return {};
  }
}

export function readPersistedState(key: string): Partial<PersistedState> {
  try {
    return parsePersistedState(localStorage.getItem(key));
  } catch {
    return {};
  }
}

export function writePersistedState(key: string, json: string) {
  try {
    localStorage.setItem(key, json);
  } catch {
    // Storage can be full or blocked; the layout then lasts only for the session.
  }
}
