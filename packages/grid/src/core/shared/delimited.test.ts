import { describe, expect, it } from 'vite-plus/test';

import { formatDelimited, parseDelimited } from '#/core/shared/delimited.ts';

describe('delimited text', () => {
  const rows = [
    ['Name', 'Note'],
    ['Ada', 'says "hi"'],
    ['Bob', 'two\nlines; and more'],
  ];

  it('quotes only values that need it', () => {
    expect(formatDelimited(rows, ';')).toBe('Name;Note\r\nAda;"says ""hi"""\r\nBob;"two\nlines; and more"');
  });

  it('reads back what it writes', () => {
    expect(parseDelimited(formatDelimited(rows, '\t'), '\t')).toEqual(rows);
  });

  it('ignores the trailing newline spreadsheets add', () => {
    expect(parseDelimited('a\tb\r\n', '\t')).toEqual([['a', 'b']]);
  });
});
