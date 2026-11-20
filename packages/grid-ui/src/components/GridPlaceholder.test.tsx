import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vite-plus/test';

import { GridPlaceholder } from '#/components/GridPlaceholder.tsx';

describe('GridPlaceholder', () => {
  it('shows the row count next to a shadcn button', () => {
    const html = renderToStaticMarkup(<GridPlaceholder data={[{ id: 1 }, { id: 2 }, { id: 3 }]} />);

    expect(html).toContain('3 rows');
    expect(html).toMatch(/<button[^>]*data-slot="button"/);
  });
});
