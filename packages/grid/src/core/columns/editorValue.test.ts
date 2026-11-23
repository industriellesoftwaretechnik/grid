import { describe, expect, it } from 'vite-plus/test';

import { matchingOptions, parseEditorText, toEditorText } from '#/core/columns/editorValue.ts';

const format = (value: unknown) => (value === 'active' ? 'Aktiv' : String(value));

describe('matchingOptions', () => {
  const options = ['inactive', 'active', 'retired'];

  it('keeps every option for an empty query', () => {
    expect(matchingOptions(options, ' ', format)).toEqual(options);
  });

  it('matches the shown text, ignoring case, with options that start with the query first', () => {
    expect(matchingOptions(options, 'akt', format)).toEqual(['active']);
    expect(matchingOptions(['inactive', 'active', 'actor'], 'act', String)).toEqual(['active', 'actor', 'inactive']);
    expect(matchingOptions(options, 'xyz', format)).toEqual([]);
  });
});

describe('parseEditorText', () => {
  it('reads numbers with a decimal point or a German decimal comma', () => {
    expect(parseEditorText('3.5', 'number')).toEqual({ value: 3.5 });
    expect(parseEditorText('1.234,5', 'number')).toEqual({ value: 1234.5 });
    expect(parseEditorText('abc', 'number')).toEqual({ error: 'number' });
  });

  it('clears the value on empty text', () => {
    expect(parseEditorText(' ', 'number')).toEqual({ value: null });
    expect(parseEditorText('', 'text')).toEqual({ value: '' });
  });

  it('reads ISO and German dates and rejects impossible ones', () => {
    expect(parseEditorText('2024-02-29', 'date')).toEqual({ value: new Date(2024, 1, 29) });
    expect(parseEditorText('1.3.2024', 'date')).toEqual({ value: new Date(2024, 2, 1) });
    expect(parseEditorText('2023-02-29', 'date')).toEqual({ error: 'date' });
  });

  it('matches select options by value or by their shown text', () => {
    expect(parseEditorText('aktiv', 'select', ['active', 'inactive'], format)).toEqual({ value: 'active' });
    expect(parseEditorText('inactive', 'select', ['active', 'inactive'], format)).toEqual({ value: 'inactive' });
    expect(parseEditorText('gone', 'select', ['active'], format)).toEqual({ error: 'option' });
  });
});

describe('toEditorText', () => {
  it('writes dates for a date input', () => {
    expect(toEditorText(new Date(2024, 0, 5), 'date')).toBe('2024-01-05');
    expect(toEditorText(null, 'text')).toBe('');
  });
});
