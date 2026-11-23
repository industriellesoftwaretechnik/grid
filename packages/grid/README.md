# @istec/grid

The data grid of [ISTEC Grid](https://github.com/industriellesoftwaretechnik/grid), a React data grid on TanStack
Table v9: the table hook, its features and the complete UI, built on Base UI.

> `0.x`: the API may still change between minor versions.

## Install

```sh
pnpm add @istec/grid @tanstack/react-table
```

Peer dependencies: `react` and `react-dom` ^19, `@tanstack/react-table` ^9. ESM only.

## Styling

The package ships its stylesheet, compiled; your app needs no Tailwind of its own. Import it once, before your own
stylesheet:

```tsx
import '@istec/grid/styles.css';
import './index.css';
```

Its classes carry an `ig:` prefix, so they never clash with your app's Tailwind classes, and they sit in a cascade
layer between Tailwind's: your base styles leave the grid alone, while your utilities and unlayered CSS still win.

The colors and radius come from the standard shadcn CSS variables (`--background`, `--foreground`, `--popover`,
`--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, and
their `-foreground` pairs), so an app set up with `shadcn init` gives the grid its theme; an app without shadcn defines them.

## Usage

```tsx
import { createGridColumnHelper, DataGrid, selectionColumn, useGrid } from '@istec/grid';

type Person = { id: string; name: string; age: number };
const helper = createGridColumnHelper<Person>();
const columns = helper.columns([
  selectionColumn<Person>(),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age', aggregationFn: 'mean' }),
]);

export function People({ people }: { people: Person[] }) {
  const table = useGrid({ id: 'people', columns, data: people, getRowId: (person) => person.id });
  return <DataGrid table={table} showFloatingFilters />;
}
```

`apps/demo` in the repository shows the rest: editing, grouping, tree and detail rows, server rows, and German texts.

## State

`useGrid` returns the TanStack table, which is the grid's API: `table.resetLayout()`, `column.toggleGroupBy()`,
`column.setAggregation()`, `column.toggleCollapsed()` and all of TanStack's own. Every state slice is controlled
(`state.sorting` with `onSortingChange`) or kept by the grid (`initialState.sorting`, with `onSortingChange` only
listening).

## Texts

The grid's texts are English. `messages` on `useGrid` replaces some or all of them; `gridMessagesDe` has German. The
placeholders are i18next's `{{name}}`, so an app's i18next bundle can supply them.

## License

MIT © ISTEC Industrielle Software-Technik GmbH
