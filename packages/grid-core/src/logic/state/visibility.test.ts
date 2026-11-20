import { describe, expect, it } from 'vite-plus/test';

import { updateOwnVisibility } from '#/logic/state/visibility.ts';

const hideAll = (current: Record<string, boolean>) => Object.fromEntries(Object.keys(current).map((id) => [id, false]));

describe('updateOwnVisibility', () => {
  it('applies changes to columns the table does not force', () => {
    expect(updateOwnVisibility({ a: true }, (current) => ({ ...current, b: false }), { c: false })).toEqual({
      a: true,
      b: false,
    });
  });

  it('keeps the user’s choice for forced columns', () => {
    expect(updateOwnVisibility({ a: true, c: true }, hideAll, { c: false, d: true })).toEqual({ a: false, c: true });
  });
});
