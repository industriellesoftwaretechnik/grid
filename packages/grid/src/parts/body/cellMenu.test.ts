import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { cellMenu } from '#/parts/body/cellMenu.ts';

type Item = { id: string; name: string; amount: number };
const helper = createColumnHelper<GridFeatures, Item>();

function setup() {
  return testTable({
    columns: helper.columns([
      helper.accessor('name', { header: 'Name' }),
      helper.accessor('amount', { header: 'Amount', enableEditing: true }),
    ]),
    data: [{ id: '1', name: 'a', amount: 1 }],
    getRowId: (item) => item.id,
  });
}

const items = (table: ReturnType<typeof setup>) =>
  cellMenu(table).flatMap((section) =>
    section.entries.map((entry) => ({ id: entry.id, disabled: 'disabled' in entry && entry.disabled }))
  );

describe('cellMenu', () => {
  it('offers copy and paste, disabled while there is nothing to act on', () => {
    const table = setup();
    expect(items(table)).toEqual([
      { id: 'copy', disabled: true },
      { id: 'copy.with-headers', disabled: true },
      { id: 'paste', disabled: true },
    ]);
  });

  it('copies any focused cell and pastes into an editable one', () => {
    const table = setup();
    table.setFocusedCell('1', 'name');
    expect(items(table).map((item) => item.disabled)).toEqual([false, false, true]);

    table.setFocusedCell('1', 'amount');
    expect(items(table).map((item) => item.disabled)).toEqual([false, false, false]);
  });
});
