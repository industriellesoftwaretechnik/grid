import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
// Not from `vite-plus`: its Vitest-typed overloads exceed TypeScript's instantiation depth on a plugin array.
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
