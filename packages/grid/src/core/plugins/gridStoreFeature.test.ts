import { describe, expect, it, vi } from 'vite-plus/test';

import { publishGridInputs } from '#/core/plugins/gridStoreFeature.ts';
import { testTable } from '#/core/table/testTable.ts';

type Item = { id: string; name: string };

function table() {
  return testTable<Item>({
    columns: [{ accessorKey: 'name', header: 'Name' }],
    data: [{ id: '1', name: 'a' }],
    getRowId: (item) => item.id,
  });
}

describe('gridStore', () => {
  it('notifies of state changes', () => {
    const grid = table();
    const listener = vi.fn<() => void>();
    grid.gridStore.subscribe(listener);

    grid.setSorting([{ id: 'name', desc: true }]);
    expect(listener).toHaveBeenCalled();
    expect(grid.gridStore.get().state).toMatchObject({ sorting: [{ id: 'name', desc: true }] });
  });

  it('notifies of published data and meta values, not of new functions', () => {
    const grid = table();
    const listener = vi.fn<() => void>();
    grid.gridStore.subscribe(listener);
    const before = grid.gridStore.get();
    const { meta } = grid.options;
    if (!meta) throw new Error('no meta');

    publishGridInputs({ ...grid, options: { ...grid.options, meta: { ...meta, renderDetail: () => null } } });
    expect(grid.gridStore.get()).toBe(before);
    expect(listener).not.toHaveBeenCalled();

    const data = [{ id: '2', name: 'b' }];
    publishGridInputs({ ...grid, options: { ...grid.options, data } });
    expect(grid.gridStore.get().data).toBe(data);
    expect(listener).toHaveBeenCalled();
  });
});
