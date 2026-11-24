# @istec/grid

Headless React data grid on [TanStack Table v9](https://tanstack.com/table), with the features AG Grid keeps for
Enterprise. Free and MIT licensed. Use your own components, or the ready-made [shadcn/ui grid](#shadcnui-grid).

[![npm](https://img.shields.io/npm/v/@istec/grid)](https://www.npmjs.com/package/@istec/grid)
[![license](https://img.shields.io/npm/l/@istec/grid)](https://github.com/industriellesoftwaretechnik/grid/blob/main/LICENSE)

> `0.x`: the API may change between minor versions.

## Features

- Row grouping, aggregation (sum, mean, median, min, max, count…) and a totals row
- Cell range selection, fill handle, copy and paste
- Cell editing with validation and undo
- Text, range and set filters, floating filters and quick search
- Master/detail rows and tree data
- Column menu, cell context menu and status bar
- Virtualized rows, pinned rows and columns, column resizing and reordering
- Persisted state and CSV export

Not included: server-side rows, pivoting, Excel export, row dragging. React 19 and ESM only.

## Install

```sh
pnpm add @istec/grid @tanstack/react-table
```

## Quick start

### shadcn/ui grid

```sh
npx shadcn add https://raw.githubusercontent.com/industriellesoftwaretechnik/grid/main/registry/data-grid.json
```

```tsx
import { DataGrid } from '@/components/data-grid/data-grid';
import { createGridColumnHelper, useGrid } from '@istec/grid';

const helper = createGridColumnHelper<Person>();
const columns = helper.columns([
  helper.accessor('name', { header: 'Name', enableEditing: true }),
  helper.accessor('salary', { header: 'Salary', aggregationFn: 'sum' }),
]);

function People({ people }: { people: Person[] }) {
  const table = useGrid({ id: 'people', columns, data: people, getRowId: (person) => person.id });
  return <DataGrid table={table} aria-label="People" showFloatingFilters />;
}
```

The components land in `components/data-grid/` and are yours to change. Their texts are in `messages.ts`.

### Your own UI

Every part of the grid is a hook that returns values, actions and element props. It renders nothing and has no texts:

```tsx
function StatusBar({ table }: { table: CoreTable<Person> }) {
  const status = useStatusBar(table);
  return (
    <footer>
      {status.shownRows} of {status.rows} rows
    </footer>
  );
}
```

A control needs no hook. Read the table with `useGridSelector` and call its actions:

```tsx
function ClearFilters({ table }: { table: CoreTable<Person> }) {
  const count = useGridSelector(table, () => table.getActiveFilterCount());
  return (
    <button disabled={count === 0} onClick={() => table.clearFilters()}>
      Clear filters ({count})
    </button>
  );
}
```

## Hooks

| Part      | Hooks                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Grid      | `useGrid`, `useGridSelector`, `useGridView`, `useColumnWidths`, `useVirtualList`                                 |
| Header    | `useHeaderRows`, `useHeaderCell`, `useColumnResizer`, `useColumnReorder`, `useColumnMenu`                        |
| Body      | `useVirtualRows`, `useDataRow`, `useBodyCell`, `useGroupRowCell`, `useRowToggle`, `useCellEditor`, `useCellMenu` |
| Selection | `useSelectAll`, `useRowSelect`                                                                                   |
| Filters   | `useFilterInput`, `useFloatingFilter`, `useRangeFilter`, `useSetFilter`, `useSearch`                             |
| Grouping  | `useGroupPanel`                                                                                                  |
| Footer    | `useTotalsRow`, `useStatusBar`, `useFormatNumber`                                                                |
| Toolbar   | `useColumnsMenu`                                                                                                 |

`useGrid` returns the TanStack table with the grid's features, and every state slice is controllable as in TanStack.
The [shadcn/ui grid](https://github.com/industriellesoftwaretechnik/grid/tree/main/apps/demo/src/components/data-grid) uses every hook and
serves as the reference.

## License

[MIT](https://github.com/industriellesoftwaretechnik/grid/blob/main/LICENSE) © ISTEC Industrielle Software-Technik GmbH
