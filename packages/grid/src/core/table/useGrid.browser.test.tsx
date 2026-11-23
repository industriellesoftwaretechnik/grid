import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import {
  functionalUpdate,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnVisibilityState,
  type GroupingState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { afterEach, describe, expect, it, vi, type Mock } from 'vite-plus/test';

import type { ColumnAggregationState } from '#/core/plugins/columnAggregationFeature.ts';
import { createGridColumnHelper, type GridInstance } from '#/core/table/tableHook.ts';
import { useGrid, type GridOptions } from '#/core/table/useGrid.ts';

type Person = { name: string; age: number };
const helper = createGridColumnHelper<Person>();
const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
]);
const data: Person[] = [
  { name: 'Grace', age: 45 },
  { name: 'Ada', age: 36 },
  { name: 'Linus', age: 28 },
];

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

type HostOptions = Omit<Partial<GridOptions<Person>>, 'data'>;

/** Renders a grid with `options`; `rerender` passes new ones, as a host re-rendering with its state would. */
function renderGrid(options: HostOptions) {
  let table: GridInstance<Person> | undefined;
  function Grid(props: HostOptions) {
    table = useGrid<Person>({ id: 'people', columns, data, persist: false, ...props });
    return null;
  }
  root = createRoot(document.createElement('div'));
  act(() => root?.render(<Grid {...options} />));
  return {
    get table() {
      if (!table) throw new Error('The grid did not render.');
      return table;
    },
    rerender: (next: HostOptions) => act(() => root?.render(<Grid {...next} />)),
  };
}

const onChangeSpy = <T,>() => vi.fn<OnChangeFn<T>>();

/** What the last change reported to `onChange` makes of `current`; like TanStack's, it may be an updater function. */
function applied<T>(onChange: Mock<OnChangeFn<T>>, current: T): T {
  const call = onChange.mock.lastCall;
  if (!call) throw new Error('No change was reported.');
  return functionalUpdate(call[0], current);
}

const names = (table: GridInstance<Person>) => table.getRowModel().rows.map((row) => row.original.name);

describe('useGrid sorting', () => {
  it('shows the sorting the host controls and reports changes to it instead of applying them', () => {
    const onSortingChange = onChangeSpy<SortingState>();
    const sorting: SortingState = [{ id: 'name', desc: false }];
    const grid = renderGrid({ state: { sorting }, onSortingChange });

    expect(names(grid.table)).toEqual(['Ada', 'Grace', 'Linus']);

    act(() => grid.table.getColumn('age')?.toggleSorting(false));

    expect(onSortingChange).toHaveBeenCalledTimes(1);
    expect(names(grid.table)).toEqual(['Ada', 'Grace', 'Linus']);

    grid.rerender({ state: { sorting: [{ id: 'age', desc: false }] }, onSortingChange });
    expect(names(grid.table)).toEqual(['Linus', 'Ada', 'Grace']);
  });

  it('keeps sorting itself from the initial state and reports each new sorting', () => {
    const onSortingChange = onChangeSpy<SortingState>();
    const grid = renderGrid({ initialState: { sorting: [{ id: 'name', desc: false }] }, onSortingChange });

    expect(names(grid.table)).toEqual(['Ada', 'Grace', 'Linus']);

    act(() => grid.table.getColumn('age')?.toggleSorting(false));

    expect(names(grid.table)).toEqual(['Linus', 'Ada', 'Grace']);
    expect(applied(onSortingChange, [{ id: 'name', desc: false }])).toEqual([{ id: 'age', desc: false }]);
  });
});

describe('useGrid uncontrolled state', () => {
  it('applies every change of one event to a slice it keeps itself', () => {
    const grid = renderGrid({});

    act(() => {
      grid.table.getColumn('age')?.setAggregation('max');
      grid.table.getColumn('name')?.setAggregation('count');
    });

    expect(grid.table.atoms.columnAggregation.get()).toEqual({ age: 'max', name: 'count' });
  });

  it('keeps the slices TanStack holds when the host neither controls nor listens to them', () => {
    const grid = renderGrid({});

    act(() => {
      grid.table.setColumnOrder(['age', 'name']);
      grid.table.setColumnSizing({ name: 300 });
      grid.table.getColumn('age')?.pin('start');
      grid.table.setFocusedCell(grid.table.getRowModel().rows[1]?.id ?? '', 'age');
    });

    expect(grid.table.atoms.columnOrder.get()).toEqual(['age', 'name']);
    expect(grid.table.atoms.columnSizing.get()).toEqual({ name: 300 });
    expect(grid.table.atoms.columnPinning.get().start).toEqual(['age']);
    expect(grid.table.atoms.cellSelection.get()).toMatchObject([{ anchorColumnId: 'age', focusColumnId: 'age' }]);
  });

  it('keeps a slice TanStack holds and reports its changes when the host only listens', () => {
    const onColumnOrderChange = onChangeSpy<ColumnOrderState>();
    const onRowSelectionChange = onChangeSpy<RowSelectionState>();
    const grid = renderGrid({ onColumnOrderChange, onRowSelectionChange });

    act(() => {
      grid.table.setColumnOrder(['age', 'name']);
      grid.table.getRowModel().rows[0]?.toggleSelected(true);
    });

    expect(grid.table.atoms.columnOrder.get()).toEqual(['age', 'name']);
    expect(applied(onColumnOrderChange, [])).toEqual(['age', 'name']);
    expect(Object.keys(grid.table.atoms.rowSelection.get())).toHaveLength(1);
    expect(onRowSelectionChange).toHaveBeenCalledTimes(1);
  });
});

describe('useGrid filters and grouping', () => {
  it('filters by the column filters and quick filter the host controls, and reports changes to them', () => {
    const onColumnFiltersChange = onChangeSpy<ColumnFiltersState>();
    const onGlobalFilterChange = onChangeSpy<unknown>();
    const grid = renderGrid({
      state: { columnFilters: [{ id: 'name', value: 'a' }], globalFilter: 'Ada' },
      onColumnFiltersChange,
      onGlobalFilterChange,
    });

    expect(names(grid.table)).toEqual(['Ada']);

    act(() => {
      grid.table.getColumn('name')?.setFilterValue(undefined);
      grid.table.setGlobalFilter('');
    });

    expect(onColumnFiltersChange).toHaveBeenCalledTimes(1);
    expect(onGlobalFilterChange).toHaveBeenCalledTimes(1);
    expect(names(grid.table)).toEqual(['Ada']);
  });

  it('groups by the grouping the host controls and reports changes to it', () => {
    const onGroupingChange = onChangeSpy<GroupingState>();
    const grid = renderGrid({ state: { grouping: ['age'] }, onGroupingChange });

    expect(grid.table.getRowModel().rows.every((row) => row.getIsGrouped())).toBe(true);

    act(() => grid.table.getColumn('age')?.toggleGrouping());

    expect(onGroupingChange).toHaveBeenCalledTimes(1);
    expect(grid.table.atoms.grouping.get()).toEqual(['age']);
  });
});

const visibleIds = (table: GridInstance<Person>) => table.getVisibleLeafColumns().map((column) => column.id);

describe('useGrid column visibility', () => {
  it('hides the columns the host hides and reports the user hiding more', () => {
    const onColumnVisibilityChange = onChangeSpy<ColumnVisibilityState>();
    const grid = renderGrid({ state: { columnVisibility: { age: false } }, onColumnVisibilityChange });

    expect(visibleIds(grid.table)).toEqual(['name']);

    act(() => grid.table.getColumn('name')?.toggleVisibility(false));

    expect(applied(onColumnVisibilityChange, { age: false })).toEqual({ age: false, name: false });
    expect(visibleIds(grid.table)).toEqual(['name']);
  });
});

describe('useGrid layout actions', () => {
  it('hides a column grouped from the UI and shows it again when ungrouped, unless it holds the group toggles', () => {
    const grid = renderGrid({ groupDisplay: 'groupColumn' });

    act(() => grid.table.getColumn('age')?.toggleGroupBy());

    expect(grid.table.atoms.grouping.get()).toEqual(['age']);
    expect(grid.table.getColumn('age')?.getIsVisible()).toBe(false);

    act(() => grid.table.getColumn('age')?.toggleGroupBy());

    expect(grid.table.atoms.grouping.get()).toEqual([]);
    expect(grid.table.getColumn('age')?.getIsVisible()).toBe(true);

    const inColumns = renderGrid({ groupDisplay: 'columns' });
    act(() => inColumns.table.getColumn('age')?.toggleGroupBy());

    expect(inColumns.table.getColumn('age')?.getIsVisible()).toBe(true);
  });

  it('returns the layout to the initial state on reset, keeping filters and sorting', () => {
    const grid = renderGrid({
      initialState: { columnAggregation: { age: 'max' }, columnSizing: { name: 120 } },
    });
    act(() => {
      grid.table.setColumnOrder(['age', 'name']);
      grid.table.setColumnSizing({ name: 300 });
      grid.table.getColumn('name')?.toggleVisibility(false);
      grid.table.getColumn('age')?.setAggregation('min');
      grid.table.getColumn('age')?.toggleSorting(false);
    });

    act(() => grid.table.resetLayout());

    expect(grid.table.atoms.columnOrder.get()).toEqual([]);
    expect(grid.table.atoms.columnSizing.get()).toEqual({ name: 120 });
    expect(visibleIds(grid.table)).toEqual(['name', 'age']);
    expect(grid.table.atoms.columnAggregation.get()).toEqual({ age: 'max' });
    expect(grid.table.atoms.sorting.get()).toEqual([{ id: 'age', desc: false }]);
  });
});

describe('useGrid column aggregation', () => {
  it('aggregates by the choice the host controls and reports the user choosing another', () => {
    const onColumnAggregationChange = onChangeSpy<ColumnAggregationState>();
    const grid = renderGrid({ state: { columnAggregation: { age: 'max' } }, onColumnAggregationChange });

    expect(grid.table.getColumn('age')?.columnDef.aggregationFn).toBe('max');

    act(() => grid.table.getColumn('age')?.setAggregation('min'));

    expect(applied(onColumnAggregationChange, { age: 'max' })).toEqual({ age: 'min' });
    expect(grid.table.getColumn('age')?.columnDef.aggregationFn).toBe('max');
  });

  it('keeps the aggregation chosen in the menu itself when the host does not control it', () => {
    const grid = renderGrid({ initialState: { columnAggregation: { age: 'max' } } });

    act(() => grid.table.getColumn('age')?.setAggregation(null));

    expect(grid.table.getColumn('age')?.columnDef.aggregationFn).toBeUndefined();
    expect(grid.table.atoms.columnAggregation.get()).toEqual({ age: null });
  });
});
