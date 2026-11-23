import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it } from 'vite-plus/test';

import { testTable } from '#/core/table/testTable.ts';
import type { GridFeatures } from '#/core/table/types.ts';
import { columnChoices } from '#/parts/toolbar/useColumnsMenu.ts';

type Item = { name: string; amount: number };
const helper = createColumnHelper<GridFeatures, Item>();

describe('columnChoices', () => {
  it('lists the columns that can be hidden, checked while shown, and keeps the menu open', () => {
    const table = testTable({
      columns: helper.columns([
        helper.display({ id: 'select', enableHiding: false }),
        helper.accessor('name', { header: 'Name' }),
        helper.accessor('amount', { header: 'Amount' }),
      ]),
      data: [{ name: 'a', amount: 1 }],
    });
    const choices = () => columnChoices(table).filter((entry) => entry.type === 'item');

    expect(choices().map((choice) => [choice.label, choice.checked, choice.keepOpen])).toEqual([
      ['Name', true, true],
      ['Amount', true, true],
    ]);
    choices()[0]?.onSelect();
    expect(table.getColumn('name')?.getIsVisible()).toBe(false);
    expect(choices()[0]?.checked).toBe(false);
  });
});
