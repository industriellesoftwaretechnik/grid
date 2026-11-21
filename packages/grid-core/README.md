# @istec/grid-core

The headless part of [ISTEC Grid](https://github.com/industriellesoftwaretechnik/grid), a React data grid on
TanStack Table v9: the table hook, its features, and a hook or model for every part of the grid, with no styling. Use
[`@istec/grid-ui`](https://www.npmjs.com/package/@istec/grid-ui) for the styled grid, or build your own UI layer on
this one.

> `0.x`: the API may still change between minor versions.

## Install

```sh
pnpm add @istec/grid-core @tanstack/react-table
```

Peer dependencies: `react` and `react-dom` ^19, `@tanstack/react-table` ^9. ESM only.

## Building a UI layer

A UI layer, such as one on MUI, has three parts. `@istec/grid-ui` is the worked example of each.

1. **The components core renders in its own columns** (`GridComponents`): the aggregated value of a group row and the
   selection checkboxes. Pass them to `useGrid` from a hook of your own:

   ```tsx
   import { useGrid, type GridComponents, type GridOptions } from '@istec/grid-core';

   const components: GridComponents = { AggregatedCell, SelectAllCheckbox, RowCheckbox };

   export function useMuiGrid<TData extends object>(options: GridOptions<TData>) {
     return useGrid({ ...options, components });
   }
   ```

2. **The markup.** Every part of the grid has a hook that returns its state, its texts and props to spread on its
   element, so a component only renders: `useGridView` for the frame, `useVirtualRows`, `useDataRow` and `useBodyCell`
   for the body, `headerRows` and `useHeaderCell` for the header, `useCellEditor`, the filter hooks, `useStatusBar`,
   and so on. Menus come as data (`columnMenu`, `cellMenu`: sections of `MenuEntry`), so they render with any menu
   component; `MenuIcon` names the icons to map to your icon set.

3. **Drag and drop** is headless too: wrap the header in `ColumnReorder`, and render `GroupChipList` and `ColumnTree`,
   passing what the dragged item looks like.

The hooks subscribe to the table state they read, so the components re-render when it changes, also under the React
Compiler. A component that calls `useVirtualRows` or `useVirtualList` opts out of the compiler with `'use no memo'`.

## Texts

The grid's texts are English. `messages` on `useGrid` replaces some or all of them; `gridMessagesDe` has German. The
placeholders are i18next's `{{name}}`, so an app's i18next bundle can supply them.

## License

MIT © ISTEC Industrielle Software-Technik GmbH
