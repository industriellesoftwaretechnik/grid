import { describe, expect, it } from 'vite-plus/test';

import type { FilterKind } from '#/logic/columns/columnMeta.ts';
import { serverFilters } from '#/logic/server/serverRequest.ts';

const kinds: Record<string, FilterKind | false> = {
  name: 'text',
  age: 'number',
  joined: 'date',
  status: 'set',
  notes: false,
};
const kindOf = (columnId: string) => kinds[columnId];

describe('serverFilters', () => {
  it('types each filter by its column', () => {
    const from = new Date(2024, 0, 1);
    expect(
      serverFilters(
        [
          { id: 'name', value: 'ada' },
          { id: 'age', value: [18, undefined] },
          { id: 'joined', value: [from, undefined] },
          { id: 'status', value: ['active'] },
        ],
        kindOf
      )
    ).toEqual([
      { columnId: 'name', kind: 'text', value: 'ada' },
      { columnId: 'age', kind: 'number', value: [18, undefined] },
      { columnId: 'joined', kind: 'date', value: [from, undefined] },
      { columnId: 'status', kind: 'set', value: ['active'] },
    ]);
  });

  it('sends the empty values of a set filter as one null', () => {
    expect(serverFilters([{ id: 'status', value: [null, undefined, '', 'active'] }], kindOf)).toEqual([
      { columnId: 'status', kind: 'set', value: [null, 'active'] },
    ]);
  });

  it('keeps an empty set filter, which matches no row', () => {
    expect(serverFilters([{ id: 'status', value: [] }], kindOf)).toEqual([
      { columnId: 'status', kind: 'set', value: [] },
    ]);
  });

  it('drops filters of unknown or unfiltered columns and malformed values', () => {
    expect(
      serverFilters(
        [
          { id: 'missing', value: 'x' },
          { id: 'notes', value: 'x' },
          { id: 'name', value: 42 },
          { id: 'age', value: 'old' },
        ],
        kindOf
      )
    ).toEqual([]);
  });

  it('opens a range bound that is not a valid value', () => {
    expect(serverFilters([{ id: 'age', value: [Number.NaN, 65] }], kindOf)).toEqual([
      { columnId: 'age', kind: 'number', value: [undefined, 65] },
    ]);
  });
});
