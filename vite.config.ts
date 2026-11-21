// Workspace-wide toolchain config. Vite+ reads `lint` and `fmt` from the root config only; each package's own
// vite.config.ts carries its Vite, test and pack settings. Globs here resolve from this file and match every
// package under `packages/*` and app under `apps/*`, so a new one needs no change here.
import { defineConfig } from 'vite-plus';

export default defineConfig({
  // Each entry runs that package's tests with its own vite.config.ts.
  test: {
    projects: ['apps/*', 'packages/*'],
  },

  lint: {
    plugins: ['typescript', 'react', 'import', 'unicorn', 'oxc', 'jsx-a11y', 'vitest'],
    jsPlugins: ['./lint/noRelativeImports.ts'],
    categories: {
      correctness: 'error',
      suspicious: 'error',
      perf: 'error',
    },
    options: {
      typeAware: true,
      denyWarnings: true,
    },
    env: {
      builtin: true,
      browser: true,
    },
    ignorePatterns: [
      'dist',
      'node_modules',
      'public',
      '.pack',
      '**/*.gen.ts',
      // shadcn output, copied in: formatted but not linted
      'packages/*/src/internal/components/**',
    ],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // `vp lint --fix` rewrites relative imports. Packages use their package.json `imports` (`#/`, with extension);
      // apps override this with the tsconfig `paths` alias (`@/`, without).
      'workspace/no-relative-imports': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'import/no-cycle': 'error',
      'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
      'typescript/no-explicit-any': 'error',
      'typescript/no-non-null-assertion': 'error',
      'typescript/no-deprecated': 'error',
      'typescript/no-unsafe-assignment': 'error',
      'typescript/strict-void-return': 'error',
      // the automatic JSX runtime needs no React import
      'react/react-in-jsx-scope': 'off',
      'react/exhaustive-deps': 'error',
      'react/only-export-components': ['error', { allowConstantExport: true }],
    },
    overrides: [
      {
        files: ['apps/*/src/**'],
        rules: {
          'workspace/no-relative-imports': ['error', { alias: '@/', extension: false }],
        },
      },
      {
        // useVirtualizer returns the same object while its values change; this hook reads its position as a value,
        // so what the compiler memoizes is recomputed when it moves.
        files: ['packages/grid-core/src/hooks/useVirtualView.ts'],
        rules: {
          'react/incompatible-library': 'off',
        },
      },
      {
        // TanStack's type-only feature slots take a phantom value (`tableMeta: {} as T`) that is never read.
        files: ['packages/grid-core/src/core/features.ts'],
        rules: {
          'typescript/no-unsafe-type-assertion': 'off',
        },
      },
      {
        files: ['**/scripts/**', '**/*.config.ts'],
        env: {
          node: true,
        },
        rules: {
          'no-console': 'off',
          // Package configs share `tooling/` at the root, which no package alias reaches.
          'workspace/no-relative-imports': 'off',
        },
      },
    ],
  },

  fmt: {
    semi: true,
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    singleQuote: true,
    trailingComma: 'es5',
    arrowParens: 'always',
    // Generated files are rewritten by their generators on every run; formatting them only creates churn.
    ignorePatterns: ['**/*.gen.ts', 'pnpm-lock.yaml', '**/CHANGELOG.md', '.pack'],
    // Import order is a formatter concern (oxlint's sort-imports cannot group).
    sortImports: {
      internalPattern: ['@/', '#/', '@istec/'],
      customGroups: [{ groupName: 'react', elementNamePattern: ['react', 'react/**', 'react-dom', 'react-dom/**'] }],
      groups: [
        'react',
        ['builtin', 'external'],
        ['internal', 'subpath', 'parent', 'sibling', 'index'],
        'style',
        'unknown',
      ],
    },
    sortTailwindcss: {
      stylesheet: './apps/demo/src/index.css',
      functions: ['cn', 'clsx', 'cva'],
    },
  },
});
