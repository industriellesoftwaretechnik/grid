# @istec/grid

A headless React data grid on TanStack Table v9 with the features otherwise found only in AG Grid Enterprise.
Bring your own UI components, or use the shadcn/ui implementation.

> `0.x`: the API may change between minor versions.

## Enterprise features

AG Grid has these only in its paid Enterprise edition:

- Row grouping
- Aggregation per column (e.g. sum, average, median, min, max, count)
- Cell range selection, with cell count, sum and average in the status bar
- Fill handle
- Copy and paste of ranges, with headers if wanted
- Master/detail rows
- Tree data
- Column menu and cell context menu
- Status bar
- And many more ...

## Not included

Server-side rows, pivoting, charts, Excel (`.xlsx`) export, tool panels / side bar, row dragging, styles of its own.
React 19 and ESM only.

## Install

```sh
pnpm add @istec/grid @tanstack/react-table
npx shadcn add https://raw.githubusercontent.com/industriellesoftwaretechnik/grid/main/registry/data-grid.json
```

The second line adds the shadcn/ui grid to `components/data-grid/`. Skip it to build your own UI.

```tsx
const table = useGrid({ id: 'people', columns, data: people, getRowId: (person) => person.id });
return <DataGrid table={table} showFloatingFilters />;
```

## Hooks

`useGrid` returns the TanStack table with the grid's features; every state slice is controllable as in TanStack. Each
part of the grid has a hook that returns its values, actions, element props and texts:

| Part      | Hooks                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Frame     | `useGridView`, `useColumnWidths`, `useVirtualList`                                                               |
| Header    | `useHeaderRows`, `useHeaderCell`, `useColumnResizer`, `useColumnReorder`, `useColumnMenu`                        |
| Body      | `useVirtualRows`, `useDataRow`, `useBodyCell`, `useGroupRowCell`, `useRowToggle`, `useCellEditor`, `useCellMenu` |
| Selection | `useSelectAll`, `useRowSelect`                                                                                   |
| Filters   | `useFloatingFilter`, `useTextFilter`, `useRangeFilter`, `useSetFilter`                                           |
| Grouping  | `useGroupPanel`                                                                                                  |
| Footer    | `useTotalsRow`, `useStatusBar`                                                                                   |
| Toolbar   | `useSearch`, `useExport`, `useExpandAll`, `useClearFilters`, `useColumnsMenu`                                    |

Menus come as data with icon names; dragging is left to your drag-and-drop library. The shadcn implementation
(`apps/demo/src/components/data-grid`) shows how each hook is used.

## License

MIT © ISTEC Industrielle Software-Technik GmbH
