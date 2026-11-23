import babel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

// Shared Vite+ config of the packages under `packages/*`: `vp pack` builds `src/index.ts` to an ESM `dist` with
// declarations, `vp test` runs the colocated tests. Dependencies and peer dependencies stay external.
export function libraryConfig() {
  return defineConfig({
    // Tests import sibling packages through the tsconfig `paths` that point at their sources.
    resolve: {
      tsconfigPaths: true,
    },
    pack: {
      entry: ['src/index.ts'],
      format: ['esm'],
      platform: 'neutral',
      dts: true,
      // Consumers get components the React Compiler has already memoized; its output imports
      // `react/compiler-runtime`, which React 19 ships.
      // The reset check only serves an app's hot reload; a published build must not carry it.
      plugins: [
        babel({ presets: [reactCompilerPreset({ environment: { enableResetCacheOnSourceFileChanges: false } })] }),
      ],
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['src/**/*.test.{ts,tsx}'],
            exclude: ['src/**/*.browser.test.{ts,tsx}'],
          },
        },
        {
          extends: true,
          // Found up front, the tests' dependencies are bundled before they run; found while they run, Vite reloads the
          // page and the tests fail.
          optimizeDeps: {
            entries: ['src/**/*.browser.test.{ts,tsx}'],
            // The scan misses it, as it resolves only inside the browser runner.
            include: ['vite-plus/test/browser/context'],
          },
          test: {
            name: 'browser',
            include: ['src/**/*.browser.test.{ts,tsx}'],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  });
}
