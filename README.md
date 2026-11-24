# ISTEC Grid

Headless React data grid on TanStack Table v9, with the features AG Grid keeps for Enterprise: row grouping,
aggregation, range selection, fill handle, clipboard, set filter, master/detail, tree data and status bar. Free and MIT
licensed.

| Package                                           | What it is                                                     |
| ------------------------------------------------- | -------------------------------------------------------------- |
| [`@istec/grid`](packages/grid#readme)             | The grid as headless hooks. Features, install and usage.       |
| [`registry/`](registry/data-grid.json)            | A complete shadcn/ui grid on the hooks, added with shadcn CLI. |
| [`apps/demo`](apps/demo/src/components/data-grid) | The demo and the source of the shadcn/ui grid.                 |

```sh
pnpm add @istec/grid @tanstack/react-table
npx shadcn add https://raw.githubusercontent.com/industriellesoftwaretechnik/grid/main/registry/data-grid.json
```

## Development

`pnpm dev` runs the demo, `pnpm verify` checks everything. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © ISTEC Industrielle Software-Technik GmbH
