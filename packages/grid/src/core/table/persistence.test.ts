import { describe, expect, it } from 'vite-plus/test';

import { parsePersistedState } from '#/core/table/persistence.ts';

describe('parsePersistedState', () => {
  it('keeps only the persisted slices', () => {
    const json = JSON.stringify({ sorting: [{ id: 'a', desc: true }], globalFilter: 'x', columnAggregation: {} });
    expect(parsePersistedState(json)).toEqual({ sorting: [{ id: 'a', desc: true }], columnAggregation: {} });
  });

  it('reads nothing from a missing, broken or non-object value', () => {
    expect(parsePersistedState(null)).toEqual({});
    expect(parsePersistedState('{')).toEqual({});
    expect(parsePersistedState('"text"')).toEqual({});
  });
});
