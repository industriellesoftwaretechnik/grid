import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { gridDefaults } from '#/core/table/defaults.ts';
import { createGridColumnHelper, type GridInstance } from '#/core/table/tableHook.ts';
import { useGrid } from '#/core/table/useGrid.ts';
import { numberRangeCodec, textCodec } from '#/parts/filters/inputCodecs.ts';
import { useFilterInput, useSearch, type DraftInput } from '#/parts/filters/useDraftInput.ts';

type Person = { name: string; age: number };
const helper = createGridColumnHelper<Person>();
const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
]);
const data: Person[] = [
  { name: 'Grace', age: 45 },
  { name: 'Ada', age: 36 },
];

let root: Root | undefined;
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.useRealTimers();
});

function renderInputs() {
  const current: {
    table?: GridInstance<Person>;
    search?: DraftInput<string>;
    name?: DraftInput<string>;
    age?: DraftInput<string>;
  } = {};
  function Inputs({ table }: { table: GridInstance<Person> }) {
    const name = table.getColumn('name');
    const age = table.getColumn('age');
    if (!name || !age) throw new Error('no columns');
    current.search = useSearch(table);
    current.name = useFilterInput(name, textCodec);
    current.age = useFilterInput(age, numberRangeCodec);
    return null;
  }
  function Grid() {
    const table = useGrid<Person>({ id: 'people', columns, data });
    current.table = table;
    return <Inputs table={table} />;
  }
  root = createRoot(document.createElement('div'));
  act(() => root?.render(<Grid />));
  const get = <K extends keyof typeof current>(key: K): NonNullable<(typeof current)[K]> => {
    const value = current[key];
    if (!value) throw new Error(`no ${key}`);
    return value;
  };
  return {
    get table() {
      return get('table');
    },
    get search() {
      return get('search');
    },
    get name() {
      return get('name');
    },
    get age() {
      return get('age');
    },
  };
}

const settle = () =>
  act(() => {
    vi.advanceTimersByTime(gridDefaults.debounceMs);
  });

describe('draft inputs', () => {
  it('show the typed text at once and write it to the table after a pause', () => {
    const grid = renderInputs();

    act(() => grid.search.change('Gr'));
    act(() => grid.name.change('a'));
    expect(grid.search.text).toBe('Gr');
    expect(grid.table.atoms.globalFilter.get()).toBeFalsy();

    settle();
    expect(grid.table.atoms.globalFilter.get()).toBe('Gr');
    expect(grid.table.getColumn('name')?.getFilterValue()).toBe('a');
    expect(grid.search.canClear).toBe(true);
  });

  it('give way to a value set elsewhere', () => {
    const grid = renderInputs();
    act(() => grid.search.change('Gr'));
    act(() => grid.age.change('≥ 40'));
    settle();

    act(() => grid.table.clearFilters());
    expect(grid.search.text).toBe('');
    expect(grid.age.text).toBe('');
    expect(grid.age.canClear).toBe(false);

    act(() => grid.table.getColumn('age')?.setFilterValue([30, 40]));
    expect(grid.age.text).toBe('30 – 40');
  });

  it('keep unreadable text without writing it', () => {
    const grid = renderInputs();
    act(() => grid.age.change('≥ 40'));
    settle();

    act(() => grid.age.change('≥ x'));
    settle();
    expect(grid.age).toMatchObject({ text: '≥ x', invalid: true });
    expect(grid.table.getColumn('age')?.getFilterValue()).toEqual([40, undefined]);
  });

  it('clear at once, dropping a pending write', () => {
    const grid = renderInputs();
    act(() => grid.name.change('a'));
    act(() => grid.name.clear());
    settle();

    expect(grid.name.text).toBe('');
    expect(grid.table.getColumn('name')?.getFilterValue()).toBeUndefined();
  });
});
