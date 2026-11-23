import { describe, expect, it } from 'vite-plus/test';

import { filterSummary, type SummaryText } from '#/logic/filters/filterSummary.ts';

const text: SummaryText = {
  format: (value) => `<${String(value)}>`,
  empty: '(empty)',
  noneSelected: 'none',
};

describe('filterSummary', () => {
  it('is empty without a filter', () => {
    expect(filterSummary('text', undefined, text)).toBe('');
    expect(filterSummary('number', [undefined, undefined], text)).toBe('');
  });

  it('shows the text of a text filter', () => {
    expect(filterSummary('text', 'ann', text)).toBe('ann');
  });

  it('shows a range by its bounds', () => {
    expect(filterSummary('number', [1, 5], text)).toBe('<1> – <5>');
    expect(filterSummary('number', [1, undefined], text)).toBe('≥ <1>');
    expect(filterSummary('date', [undefined, 5], text)).toBe('≤ <5>');
    expect(filterSummary('number', [3, 3], text)).toBe('<3>');
  });

  it('names the set values and counts them when there are more than two', () => {
    expect(filterSummary('set', [], text)).toBe('none');
    expect(filterSummary('set', ['a', null], text)).toBe('<a>, (empty)');
    expect(filterSummary('set', [null, undefined, ''], text)).toBe('(empty)');
    expect(filterSummary('set', ['a', 'b', 'c'], text)).toBe('(3) <a>, <b>, <c>');
  });
});
