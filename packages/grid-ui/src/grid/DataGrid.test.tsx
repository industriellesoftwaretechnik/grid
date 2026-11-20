import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vite-plus/test';

import { DataGrid } from '#/grid/DataGrid.tsx';
import { useDataGrid } from '#/useDataGrid.ts';
import { createGridColumnHelper, gridMessagesDe, selectionColumn } from '@istec/grid-core';

type Person = { name: string; age: number };
const helper = createGridColumnHelper<Person>();
const columns = helper.columns([
  selectionColumn<Person>(),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
]);
const data: Person[] = [
  { name: 'Ada', age: 36 },
  { name: 'Grace', age: 45 },
];

function People({ messages }: { messages?: typeof gridMessagesDe }) {
  const table = useDataGrid({ id: 'people', columns, data, messages });
  return <DataGrid table={table} />;
}

describe('DataGrid', () => {
  it('renders the header, the select-all checkbox and the status bar', () => {
    const html = renderToStaticMarkup(<People />);

    expect(html).toContain('>Name<');
    expect(html).toContain('>Age<');
    expect(html).toContain('aria-label="Select all rows"');
    expect(html).toContain('2 rows');
  });

  it('shows the texts it is given', () => {
    const html = renderToStaticMarkup(<People messages={gridMessagesDe} />);

    expect(html).toContain('aria-label="Alle Zeilen auswählen"');
    expect(html).toContain('2 Zeilen');
  });
});
