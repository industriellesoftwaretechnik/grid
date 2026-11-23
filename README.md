# ISTEC Grid

A headless React data grid on TanStack Table v9 with the features otherwise found only in AG Grid Enterprise: row
grouping, aggregation, range selection, fill handle, clipboard, set filter, master/detail, tree data and status bar.
Free and MIT licensed.

- [`@istec/grid`](packages/grid#readme): the grid's logic as hooks. Features, limits and usage are documented there.
- [`registry/`](registry/data-grid.json): a complete shadcn/ui grid built on the hooks, installed with the shadcn CLI.

```sh
pnpm add @istec/grid @tanstack/react-table
npx shadcn add https://raw.githubusercontent.com/industriellesoftwaretechnik/grid/main/registry/data-grid.json
```

Development: `pnpm dev` runs the demo; see [CONTRIBUTING.md](CONTRIBUTING.md).

[MIT](LICENSE) © ISTEC Industrielle Software-Technik GmbH
