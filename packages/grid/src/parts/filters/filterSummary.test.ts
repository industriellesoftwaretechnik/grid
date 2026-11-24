import { describe, expect, it } from 'vite-plus/test';

import { filterSummary } from '#/parts/filters/filterSummary.ts';

const format = (value: unknown) => `<${String(value)}>`;

describe('filterSummary', () => {
  it('is unset without a filter', () => {
    expect(filterSummary('text', undefined, format)).toBeUndefined();
    expect(filterSummary('number', [undefined, undefined], format)).toBeUndefined();
  });

  it('gives the text of a text filter', () => {
    expect(filterSummary('text', 'ann', format)).toEqual({ kind: 'text', text: 'ann' });
  });

  it('gives the bounds of a range as text', () => {
    expect(filterSummary('number', [1, 5], format)).toEqual({ kind: 'range', from: '<1>', to: '<5>' });
    expect(filterSummary('date', [undefined, 5], format)).toEqual({ kind: 'range', from: undefined, to: '<5>' });
  });

  it('gives the chosen set values as text, blanks as one flag', () => {
    expect(filterSummary('set', [], format)).toEqual({ kind: 'set', values: [], blank: false });
    expect(filterSummary('set', ['a', null, 'a', undefined, ''], format)).toEqual({
      kind: 'set',
      values: ['<a>'],
      blank: true,
    });
  });
});
