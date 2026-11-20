# @istec/grid-core

The headless part of [ISTEC Grid](https://github.com/industriellesoftwaretechnik/grid): React hooks, TanStack Table
v9 features and pure logic, with no styling. Use it to build your own grid UI, or use
[`@istec/grid-ui`](https://www.npmjs.com/package/@istec/grid-ui) for the styled one.

> `0.x`: placeholders only while the grid moves in.

## Install

```sh
pnpm add @istec/grid-core @tanstack/react-table
```

Peer dependencies: `react` ^19, `@tanstack/react-table` ^9. ESM only.

## Usage

```tsx
import { rowCountLabel, useGridTable } from '@istec/grid-core';

function RowCount({ data }: { data: { id: number }[] }) {
  const table = useGridTable({ data, columns: [{ accessorKey: 'id' }] });
  return <span>{rowCountLabel(table.getRowModel().rows.length)}</span>;
}
```

## License

MIT © ISTEC Industrielle Software-Technik GmbH
