import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { afterEach, describe, expect, it } from 'vite-plus/test';

import { selectionColumn } from '#/columns/selectionColumn.tsx';
import { createGridColumnHelper } from '#/core/tableHook.tsx';
import { DataGrid } from '#/grid/DataGrid.tsx';
import { useGrid } from '#/hooks/useGrid.ts';

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

function People() {
  const table = useGrid({ id: 'people', columns, data });
  return (
    <div style={{ height: 400, display: 'flex' }}>
      <DataGrid table={table} />
    </div>
  );
}

let root: Root | undefined;
let host: HTMLElement | undefined;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
});

function render(element: React.ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(element));
  return host;
}

describe('DataGrid', () => {
  it('selects all rows from the header checkbox', async () => {
    const grid = render(<People />);

    expect(grid.querySelector('th')?.parentElement?.textContent).toContain('Name');
    const selectAll = grid.querySelector<HTMLElement>('[role=checkbox][aria-label="Select all rows"]');
    expect(selectAll).not.toBeNull();

    await act(async () => selectAll?.click());

    const rowBoxes = grid.querySelectorAll<HTMLElement>('tbody [role=checkbox]');
    expect(rowBoxes).toHaveLength(2);
    expect([...rowBoxes].every((box) => box.getAttribute('aria-checked') === 'true')).toBe(true);
  });

  it('opens the cell menu on a right click', async () => {
    const grid = render(<People />);
    const cell = [...grid.querySelectorAll('td')].find((td) => td.textContent === 'Ada');

    await act(async () => {
      cell?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    });

    await expect
      .poll(() => [...document.querySelectorAll('[role=menu] [role=menuitem]')].map((item) => item.textContent))
      .toContainEqual(expect.stringMatching(/^Copy/));
  });
});
