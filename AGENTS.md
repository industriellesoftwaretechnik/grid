# AGENTS.md

A React data grid on TanStack Table v9, published as one npm package with its full UI. pnpm workspace on Vite+ (`vp`).

## Layout

| Path                  | What                                                                      | Published      |
| --------------------- | ------------------------------------------------------------------------- | -------------- |
| `packages/grid`       | `@istec/grid`: logic, TanStack Table features and the grid's UI           | yes            |
| `apps/demo`           | Vite app consuming the package from source; dev playground, later demo    | no (`private`) |
| `apps/docs` (planned) | Documentation site                                                        | no (`private`) |
| `tooling/`            | Shared Vite+ config of the packages (`libraryConfig.ts`)                  |                |
| `lint/`, `scripts/`   | Custom oxlint rule; the packed-tarball check behind `pnpm check:packages` |                |

Every config matches `packages/*` and `apps/*`, so a new package or app is only a new folder: give it a
`package.json` (apps `"private": true`), `tsconfig.json`, `vite.config.ts` and `build`/`typecheck` scripts.

## Sources of truth

- Commands: root `package.json` scripts. `pnpm verify` is the full gate (check, typecheck, test, build,
  publint + attw on the packed tarballs) and must stay green.
- Versions: `pnpm-workspace.yaml` `catalog:`; lint and format rules: root `vite.config.ts`; compiler options:
  `tsconfig.base.json`; packaging: `tooling/libraryConfig.ts` and each package's `package.json`.
- Vite+ docs: `node_modules/vite-plus/docs` and `node_modules/vite-plus/AGENTS.md`.
- Release flow: `CONTRIBUTING.md`.

## Rules

- `@istec/grid` holds the logic and renders the whole grid (`src/grid/`) with its own controls: shadcn components on
  Base UI, copied into `src/internal/components/` (shadcn naming, not linted), whose deps are real dependencies. Menus
  are data (`MenuSection`) that `MenuEntries` renders.
- A component keeps its logic. Only when that grows large does it move into a hook in a file next to the component
  (`header/useHeaderCell.ts` beside `header/HeaderCell.tsx`); pure models with tests sit there too (`columnMenu.ts`).
  None of this is exported: the public API is `useGrid` and the table it returns, `DataGrid` and the parts a host
  places in it (toolbar, status bar), the two hooks a host's own grid components use (`useGridContext`,
  `useGridSelector`) and the types around them.
  Whatever a hook or component reads from table state comes out of a `useGridSelector` selector, never the component
  body, so the store decides when it renders and the React Compiler can memoize the rest; see its doc comment. No
  `'use no memo'`.
- Styling is Tailwind v4, compiled to `dist/styles.css` (`src/styles.css`), so a host needs no Tailwind of
  its own. Every class carries the `ig:` prefix (`ig:flex ig:hover:bg-muted`), also in `src/internal/components/`.
  Colors and radius come from the host's shadcn variables, mapped in `@theme inline`; a theming system comes later.
  In arbitrary values use `--theme(--color-primary)`, never `var(--primary)`.
- React, react-dom and `@tanstack/react-table` are peer dependencies, never bundled.
- Imports inside a package go through `#/…` with the file extension; apps use `@/…`. No relative imports.
- File names: PascalCase for components (`DataGrid.tsx`), camelCase for modules (`columnInfo.ts`); kebab-case only
  for shadcn output.
- Tests sit next to the code (`*.test.ts(x)`) and import from `vite-plus/test`. `*.browser.test.tsx` run in Chromium
  (Vitest browser mode): use them for behavior through `useGrid` and the rendered grid, which needs a real DOM; install
  the browser once with `vp exec playwright install chromium`.
- Every grid state slice is controllable as in TanStack: `state.x` + `onXChange`, or `initialState.x`. Grid-specific
  state and actions are TanStack features in `packages/grid/src/plugins/`, called as table and column APIs;
  `meta` carries only values.
- A change to a published package needs a changeset (`pnpm changeset`).
- Comments are rare: only for what the code cannot say.
