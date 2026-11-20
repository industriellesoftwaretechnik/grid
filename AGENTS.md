# AGENTS.md

A React data grid on TanStack Table v9, published as two npm packages. pnpm workspace on Vite+ (`vp`).

## Layout

| Path                  | What                                                                      | Published      |
| --------------------- | ------------------------------------------------------------------------- | -------------- |
| `packages/grid-core`  | `@istec/grid-core`: headless hooks, TanStack Table features, pure logic   | yes            |
| `packages/grid-ui`    | `@istec/grid-ui`: the styled grid (Tailwind v4, shadcn-style components)  | yes            |
| `apps/demo`           | Vite app consuming both packages from source; dev playground, later demo  | no (`private`) |
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

- Logic lives in `grid-core`; `grid-ui` renders. A part of the grid gets a hook or model in
  `packages/grid-core/src/headless/` that returns state, texts and element props, so another UI layer (MUI, …) needs
  only markup. Hooks that read table methods subscribe with `useGridSelector` and opt out of the React Compiler
  (`'use no memo'`); see its doc comment.
- `grid-core` has no styling and no Tailwind. `grid-ui` uses only the standard shadcn CSS variables, so it takes on
  the host's theme, and never relies on the host's shadcn setup: primitives are copied into
  `packages/grid-ui/src/internal/components/` (shadcn naming, not linted) and their deps are real dependencies.
- React, react-dom and `@tanstack/react-table` are peer dependencies, never bundled.
- Imports inside a package go through `#/…` with the file extension; apps use `@/…`. No relative imports.
- File names: PascalCase for components (`DataGrid.tsx`), camelCase for modules (`columnInfo.ts`); kebab-case only
  for shadcn output.
- Tests sit next to the code (`*.test.ts(x)`) and import from `vite-plus/test`.
- A change to a published package needs a changeset (`pnpm changeset`).
- Comments are rare: only for what the code cannot say.
