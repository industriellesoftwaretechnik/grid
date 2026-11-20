# ISTEC Grid

A data grid for React, built on [TanStack Table](https://tanstack.com/table) v9: an open alternative to AG Grid
for apps that use Tailwind CSS and shadcn/ui.

> Early days: the packages are at `0.x`. Expect breaking changes until the API settles.

## Packages

| Package                                         | What                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| [`@istec/grid-core`](packages/grid-core#readme) | Headless: React hooks, TanStack Table features and pure logic. No styling.     |
| [`@istec/grid-ui`](packages/grid-ui#readme)     | The styled grid on top of grid-core: Tailwind CSS v4, shadcn-style components. |

Both packages always share one version.

## Install

The styled grid (brings `@istec/grid-core` along):

```sh
pnpm add @istec/grid-ui @tanstack/react-table
```

Then let your Tailwind build see the grid's classes (see the [grid-ui README](packages/grid-ui#readme)).

Headless only:

```sh
pnpm add @istec/grid-core @tanstack/react-table
```

Both need React 19. They are ESM-only.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © ISTEC Industrielle Software-Technik GmbH
