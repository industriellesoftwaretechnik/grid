import { createColumnHelper } from '@tanstack/react-table';
import { expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { rowCount } from '#/parts/body/useRowToggle.ts';

type Item = { id: string; team: string; city: string };
const helper = createColumnHelper<GridFeatures, Item>();

it('counts the data rows of a group, not the groups nested in it', () => {
  const table = testTable({
    columns: helper.columns([helper.accessor('team', {}), helper.accessor('city', {})]),
    data: [
      { id: '1', team: 'red', city: 'Bonn' },
      { id: '2', team: 'red', city: 'Köln' },
      { id: '3', team: 'red', city: 'Köln' },
    ],
    getRowId: (item) => item.id,
  });
  table.setGrouping(['team', 'city']);

  const [red] = table.getGroupedRowModel().rows;
  expect(red && rowCount(red)).toBe(3);
});
