# ISTEC Grid

A data grid for React, built on [TanStack Table](https://tanstack.com/table) v9: an open alternative to AG Grid.

> Early days: the package is at `0.x`. Expect breaking changes until the API settles.

## Package

[`@istec/grid`](packages/grid#readme) is the whole grid: the table hook, its features and the UI, built on Base UI
and shipped with a compiled stylesheet, so an app needs no component library or Tailwind of its own.

## Install

```sh
pnpm add @istec/grid @tanstack/react-table
```

Then import `@istec/grid/styles.css` before your own stylesheet (see the [package README](packages/grid#readme)). It
needs React 19 and is ESM-only.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © ISTEC Industrielle Software-Technik GmbH
