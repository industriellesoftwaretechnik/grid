# AGENTS.md

`packages/grid` is `@istec/grid`, a headless React data grid on TanStack Table v9. `apps/demo/src/components/data-grid`
is its shadcn/ui implementation, published as the shadcn registry in `registry/`. pnpm workspace on Vite+ (`vp`); its
docs are in `node_modules/vite-plus/docs`.

## Commands

- `pnpm verify` is the gate CI runs and stays green; the separate scripts are in `package.json`.
- After changing the shadcn implementation, run `pnpm registry` and commit `registry/`. A new file in it is also listed
  in `apps/demo/registry.json`.
- `*.browser.test.tsx` run in Chromium (`vp exec playwright install chromium` once), every other test in Node.
- Release flow: `CONTRIBUTING.md`.

## Layout of `packages/grid/src`

- `index.ts` is the whole public API.
- `core/` is what the parts build on and never imports `parts/`. `core/plugins/` holds the grid's state and actions as
  TanStack features, registered in `core/table/features.ts`. `core/table/` holds `useGrid`, `gridMeta` and
  `useGridSelector`; `testTable.ts` there builds a table for tests.
- `parts/<area>/` holds one hook per part of the grid, returning a model of values, actions and prop getters. Pure
  functions sit beside the hook, which is where unit tests target.
- Imports use `#/` with the `.ts` extension; the demo uses `@/` without one. Relative imports fail lint.

## Rules

- The package renders nothing. Runtime dependencies stay TanStack only.
- Every state slice is controllable as in TanStack. `meta` carries only values. A control needs no hook when
  `useGridSelector` and a table action do.
- Hooks and components read table state and meta only through `useGridSelector` or a hook's model, never in the render
  body (see `useGridSelector`'s doc comment).
- The package has no texts, only a `locale` (`docs/adr/0001-package-has-no-texts.md`). Models return values and ids;
  the shadcn texts are in `messages.ts`.
- The shadcn implementation is the reference use of every hook and changes together with it, as does the hooks table
  in `packages/grid/README.md`.

## To do

- **The shadcn implementation only works with Base UI.** `anchored-popover.tsx` imports `@base-ui/react` directly, so
  the registry installs it as a dependency, and other files use Base UI props (`render` on `DropdownMenuTrigger`,
  `initialFocus`/`finalFocus` on `PopoverContent`). It should work with any shadcn flavour, Radix included, using
  only the components from `@/components/ui/`. For the popovers, one way is to position them against an invisible
  `PopoverTrigger` that covers the cell.
