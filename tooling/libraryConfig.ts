import babel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

export function libraryConfig() {
  return defineConfig({
    // Tests import sibling packages from their sources through the tsconfig `paths`.
    resolve: {
      tsconfigPaths: true,
    },
    pack: {
      entry: ['src/index.ts'],
      format: ['esm'],
      platform: 'neutral',
      dts: true,
      // Ships precompiled (`react/compiler-runtime` comes with React 19); the reset check only serves hot reload.
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
          // Deps discovered mid-run make Vite reload the page and fail the tests, so they are prebundled.
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
