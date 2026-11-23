import { describe, expect, it } from 'vite-plus/test';

import de from '#/core/locale/de.ts';
import { createTranslate } from '#/core/locale/messages.ts';

describe('createTranslate', () => {
  it('falls back to English for keys the given messages leave out', () => {
    const t = createTranslate({ search: 'Suchen…' });
    expect(t('search')).toBe('Suchen…');
    expect(t('export')).toBe('Export');
  });

  it('fills in the values', () => {
    const t = createTranslate(de);
    expect(t('status.filtered', { count: 3, total: '1.000' })).toBe('3 von 1.000 Zeilen');
  });

  it('keeps a placeholder it has no value for', () => {
    expect(createTranslate()('status.rows')).toBe('{{count}} rows');
  });
});
