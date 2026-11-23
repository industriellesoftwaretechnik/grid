# AGENTS.md

`packages/grid` is `@istec/grid`, a headless React data grid on TanStack Table v9. `apps/demo/src/components/data-grid`
is its shadcn/ui implementation, published as the shadcn registry in `registry/`. pnpm workspace on Vite+ (`vp`); its
docs are in `node_modules/vite-plus/docs`.

- `pnpm verify` is the gate and stays green. After changing the shadcn implementation, run `pnpm registry` and commit
  `registry/`. Browser tests need `vp exec playwright install chromium` once.
- The package renders nothing: each part of the grid is a hook in `src/parts/` returning a model of values, actions,
  prop getters and texts. `src/core/` is what the parts build on. Runtime dependencies stay TanStack only.
- The shadcn implementation is the reference use of every hook; change it together with the hook.
- Hooks and components read table state and meta only through `useGridSelector` or a hook's model, never in the render
  body (see `useGridSelector`'s doc comment).
- Grid state and actions are TanStack features in `src/core/plugins/`; every state slice is controllable as in
  TanStack. `meta` carries only values.
- Release flow: `CONTRIBUTING.md`.
