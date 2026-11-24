import { describe, expect, it } from 'vite-plus/test';

import { boundsCodec, numberRangeCodec, parseNumberRange, textCodec } from '#/parts/filters/inputCodecs.ts';

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

describe('codecs', () => {
  it('write a value back as text that reads as the same value', () => {
    for (const value of [
      [5, 5],
      [10, undefined],
      [undefined, 1.5],
      [-5, 20],
      [1e21, 1e-7],
    ]) {
      expect(numberRangeCodec.toValue(numberRangeCodec.toText(value))).toEqual(value);
    }
    expect(numberRangeCodec.toText([1234.5, 1234.5])).toBe('1234.5');
    expect(textCodec.toValue(textCodec.toText('ann'))).toBe('ann');
  });

  it('read empty text as no filter', () => {
    expect(textCodec.toValue('')).toBeUndefined();
    expect(numberRangeCodec.toValue('')).toBeUndefined();
    expect(boundsCodec('number').toValue(['', ''])).toBeUndefined();
  });

  it('read the bounds of two inputs, either of which may stay empty', () => {
    expect(boundsCodec('number').toValue(['3', ''])).toEqual([3, undefined]);
    expect(boundsCodec('number').toText([3, undefined])).toEqual(['3', '']);
    // The upper bound covers its whole day.
    expect(boundsCodec('date').toValue(['2026-01-31', '2026-02-01'])).toEqual([
      new Date(2026, 0, 31),
      new Date(2026, 1, 1, 23, 59, 59, 999),
    ]);
    expect(boundsCodec('date').toText([new Date(2026, 0, 31), undefined])).toEqual(['2026-01-31', '']);
  });
});
