# @istec/grid-ui

The styled data grid of [ISTEC Grid](https://github.com/industriellesoftwaretechnik/grid), built on
[`@istec/grid-core`](https://www.npmjs.com/package/@istec/grid-core) with Tailwind CSS v4 and shadcn-style
components.

> `0.x`: the API may still change between minor versions.

## Install

```sh
pnpm add @istec/grid-ui @tanstack/react-table
```

Peer dependencies: `react` and `react-dom` ^19, `@tanstack/react-table` ^9, `tailwindcss` ^4. ESM only.

The shadcn primitives the grid uses ship inside the package, so your app needs no shadcn components of its own.

## Styling

The package ships compiled JavaScript with plain Tailwind class names and no CSS. Your app's Tailwind build
generates the CSS, so the grid uses your theme. Two things are needed:

1. **Let Tailwind scan the package.** Tailwind v4 skips `node_modules`, so add a `@source` to the stylesheet that
   imports Tailwind. The path is relative to that CSS file:

   ```css
   @import 'tailwindcss';

   @source '../node_modules/@istec/grid-ui/dist';
   ```

   With the stylesheet at `src/index.css`, that is `../node_modules/...`; adjust the number of `../` to where your
   CSS file lives. In a pnpm workspace, point at the `node_modules` of the app that depends on the grid.

2. **A shadcn-compatible theme.** The grid uses the standard shadcn CSS variables (`--background`, `--foreground`,
   `--card`, `--muted`, `--muted-foreground`, `--primary`, `--border`, `--input`, `--ring`, `--radius`, …) through
   Tailwind colors such as `bg-card` and `border-border`. An app set up with `shadcn init` already has them; otherwise
   copy a theme from [ui.shadcn.com/themes](https://ui.shadcn.com/themes), including its `@theme inline` block.

There is no prebuilt stylesheet for apps without Tailwind yet.

## Usage

```tsx
import { createGridColumnHelper, DataGrid, selectionColumn, useDataGrid } from '@istec/grid-ui';

type Person = { id: string; name: string; age: number };
const helper = createGridColumnHelper<Person>();
const columns = helper.columns([
  selectionColumn<Person>(),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age', aggregationFn: 'mean' }),
]);

export function People({ people }: { people: Person[] }) {
  const table = useDataGrid({ id: 'people', columns, data: people, getRowId: (person) => person.id });
  return <DataGrid table={table} showFloatingFilters />;
}
```

This package re-exports all of `@istec/grid-core`, so an app imports from here alone. `apps/demo` in the repository
shows the rest: editing, grouping, tree and detail rows, server rows, and German texts.

## License

MIT © ISTEC Industrielle Software-Technik GmbH
