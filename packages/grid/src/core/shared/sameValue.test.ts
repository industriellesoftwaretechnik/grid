import { describe, expect, it } from 'vite-plus/test';

import { sameShallow, sameValue } from '#/core/shared/sameValue.ts';

class Instance {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

const fn = () => 1;

describe('sameValue', () => {
  it('compares arrays and plain objects by their items', () => {
    expect(sameValue({ a: [1, { b: 'x' }], fn }, { a: [1, { b: 'x' }], fn })).toBe(true);
    expect(sameValue({ a: [1, { b: 'x' }] }, { a: [1, { b: 'y' }] })).toBe(false);
    expect(sameValue([1, 2], [1, 2, 3])).toBe(false);
    expect(sameValue({ a: 1 }, { b: 1 })).toBe(false);
  });

  it('compares other objects and functions by identity', () => {
    expect(sameValue({ row: new Instance('a') }, { row: new Instance('a') })).toBe(false);
    expect(sameValue({ onClick: () => 1 }, { onClick: () => 1 })).toBe(false);
  });

  it('stops comparing items below the depth', () => {
    expect(sameValue([[1]], [[1]], 1)).toBe(false);
    expect(sameShallow({ a: [1] }, { a: [1] })).toBe(false);
    const items = [1];
    expect(sameShallow({ a: items }, { a: items })).toBe(true);
  });
});
