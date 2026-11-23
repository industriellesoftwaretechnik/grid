# Contributing

## Setup

Requirements: [Vite+](https://viteplus.dev/guide/) (`vp`) installed globally. It provides the Node version from
`.node-version` and the pnpm version from `devEngines` in `package.json`.

```sh
vp install      # install dependencies
pnpm dev        # start apps/demo, which uses the package from source with hot reload
```

| Script                | What                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `pnpm check`          | Format check and lint (`vp check`); `pnpm check:fix` fixes what it can                 |
| `pnpm typecheck`      | `tsc -b --noEmit` (TypeScript 7) for the root configs and every package                |
| `pnpm test`           | All tests (`vp test`)                                                                  |
| `pnpm build`          | `vp pack` for the package, `vp build` for the apps                                     |
| `pnpm check:packages` | Packs the packages with pnpm and runs publint and attw on the tarballs (needs a build) |
| `pnpm verify`         | All of the above, the gate CI runs on every PR                                         |

Workspace packages resolve to each other's sources (tsconfig `paths`, picked up by Vite), so nothing has to be
built before `dev`, `test` or `typecheck`. See [AGENTS.md](AGENTS.md) for layout and code rules.

## Changesets

Every PR that changes what `@istec/grid` ships needs a changeset:

```sh
pnpm changeset
```

Pick the bump and write a line for the changelog, then commit the generated `.changeset/*.md`. While we are on
`0.x`, use `minor` for breaking changes and `patch` for everything else. Changes to apps, tooling or tests need no changeset.

## Release flow

Releases are automated by `.github/workflows/release.yml` with
[Changesets](https://changesets.dev/guide/automating):

1. A merge to `main` with pending changesets opens or updates the **Version packages** PR. It bumps the versions,
   writes the changelogs and deletes the consumed changesets.
2. Merging that PR runs the workflow again. With no changesets left and versions not yet on npm, it runs
   `pnpm verify`, packs the packages, publishes them to npm with provenance, and creates a git tag and a GitHub
   release per package.

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC): the job gets a
short-lived token from GitHub, so there is no `NPM_TOKEN` secret.

A PR opened with the default `GITHUB_TOKEN` does not trigger other workflows, so CI does not run on the Version
packages PR by itself. Close and reopen it to run CI, or switch the version job to a GitHub App token.

### One-time setup (needs a human)

1. **npm org:** create the `istec` organization on npmjs.com (free for public packages) and add the maintainers.
2. **First publish, by hand:** npm only lets you configure a trusted publisher for a package that already exists,
   and it has no "pending publisher" like PyPI. Publish the very first version of each package once from a
   maintainer's machine:

   ```sh
   npm login                                   # account in the istec org, with 2FA
   pnpm install && pnpm verify
   pnpm -r --filter "./packages/*" publish --access public --no-git-checks
   ```

   `--provenance` only works in CI, so add `--no-provenance` if npm complains locally (or temporarily
   remove `publishConfig.provenance`). Alternatively publish a minimal placeholder under each name (e.g. with
   [`setup-npm-trusted-publish`](https://github.com/azu/setup-npm-trusted-publish)) and let CI publish the first
   real version.

3. **Trusted publishers:** for `@istec/grid`, open the package settings on
   npmjs.com → _Trusted publishing_ → GitHub Actions, and enter organization `industriellesoftwaretechnik`,
   repository `grid`, workflow filename `release.yml`, no environment. A new configuration must see a
   successful publish within 2 days or it expires, so release soon after setting it up.
4. **Lock it down:** in the package's settings, set publishing access to _Require two-factor authentication and
   disallow tokens_, so only the workflow can publish.
5. **GitHub:** in the repository settings, _Actions → General_, enable _Allow GitHub Actions to create and approve
   pull requests_ (needed for the Version packages PR).

### Prereleases (`next`)

Not automated. To publish prereleases under the `next` dist-tag:

```sh
pnpm changeset pre enter next   # commit .changeset/pre.json
```

While `pre.json` is on `main`, the release workflow publishes versions like `0.3.0-next.0` to the `next` tag.
Leave prerelease mode with `pnpm changeset pre exit` and commit; the next release is stable again. Read the
[Changesets prerelease guide](https://changesets.dev/guide/prereleases) before using it.
