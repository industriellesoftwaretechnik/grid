import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vite-plus/test';

import { useGridTable } from '#/hooks/useGridTable.ts';
import { rowCountLabel } from '#/logic/rowCountLabel.ts';

function RowCount({ data }: { data: { id: number }[] }) {
  const table = useGridTable({ data, columns: [{ accessorKey: 'id' }] });
  return <output>{rowCountLabel(table.getRowModel().rows.length)}</output>;
}

describe('useGridTable', () => {
  it('builds the row model from the data', () => {
    expect(renderToStaticMarkup(<RowCount data={[{ id: 1 }, { id: 2 }]} />)).toBe('<output>2 rows</output>');
  });
});

describe('rowCountLabel', () => {
  it('uses the singular for one row', () => {
    expect(rowCountLabel(1)).toBe('1 row');
  });
});
