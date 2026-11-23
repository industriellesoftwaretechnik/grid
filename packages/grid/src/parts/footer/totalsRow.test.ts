import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { totalsRow } from '#/parts/footer/totalsRow.ts';

type Item = { team: string; points: number };
const helper = createColumnHelper<GridFeatures, Item>();

describe('totalsRow', () => {
  it('gives aggregated columns their total with its mark, and other columns none', () => {
    const table = testTable({
      columns: helper.columns([
        helper.accessor('team', { aggregationFn: 'count' }),
        helper.accessor('points', { aggregationFn: 'sum', meta: { formatValue: (value) => `${String(value)} pts` } }),
        helper.display({ id: 'actions' }),
      ]),
      data: [
        { team: 'red', points: 5 },
        { team: 'blue', points: 7 },
      ],
    });

    const cells = totalsRow(table).map((slot) => (slot === 'filler' ? slot : [slot.column.id, slot.total]));
    expect(cells).toEqual([
      ['team', { mark: { symbol: '#', name: 'Count' }, text: '2' }],
      ['points', { mark: { symbol: 'Σ', name: 'Sum' }, text: '12 pts' }],
      ['actions', undefined],
      'filler',
    ]);
  });
});
