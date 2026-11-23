import { describe, expect, it } from 'vite-plus/test';

import { parseNumberRange } from '#/logic/filters/filterText.ts';

describe('parseNumberRange', () => {
  it('reads a single number as an exact match', () => {
    expect(parseNumberRange('5')).toEqual([5, 5]);
    expect(parseNumberRange('= -2,5')).toEqual([-2.5, -2.5]);
  });

  it('reads open ranges, with > and < as inclusive', () => {
    expect(parseNumberRange('≥ 10')).toEqual([10, undefined]);
    expect(parseNumberRange('>=10')).toEqual([10, undefined]);
    expect(parseNumberRange('> 10')).toEqual([10, undefined]);
    expect(parseNumberRange('≤ 1.5')).toEqual([undefined, 1.5]);
    expect(parseNumberRange('<= 1.000,5')).toEqual([undefined, 1000.5]);
  });

  it('reads closed ranges, also between negative numbers', () => {
    expect(parseNumberRange('10 – 20')).toEqual([10, 20]);
    expect(parseNumberRange('10-20')).toEqual([10, 20]);
    expect(parseNumberRange('-5 - -1')).toEqual([-5, -1]);
    expect(parseNumberRange('1..2')).toEqual([1, 2]);
  });

  it('tells empty from unreadable text', () => {
    expect(parseNumberRange('  ')).toBeUndefined();
    expect(parseNumberRange('abc')).toBeNull();
    expect(parseNumberRange('≥')).toBeNull();
  });
});
