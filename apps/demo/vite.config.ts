import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
// `defineConfig` comes from the core rather than from `vite-plus`: the vite-plus re-export carries Vitest's
// config typings, and resolving its overloads against a plugin array exceeds TypeScript's instantiation depth.
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig(({ mode }) => {
  // Tests need none of the build plugins: no React Compiler pass, no Tailwind.
  const plugins: PluginOption[] =
    mode === 'test'
      ? []
      : [
          react(),
          // babel() resolves to `Promise<Plugin>`; widened so the PluginOption union stays checkable.
          babel({ presets: [reactCompilerPreset()] }) as PluginOption,
          tailwindcss(),
        ];

  return {
    plugins,
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      passWithNoTests: true,
    },
  };
});
