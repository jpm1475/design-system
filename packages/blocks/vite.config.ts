import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import preserveDirectives from 'rollup-preserve-directives';
import { readdirSync, existsSync } from 'node:fs';

// One entry per component folder so `@jpm1475/ds-components/Button` resolves to dist/Button/index.js.
const componentEntries = Object.fromEntries(
  readdirSync('src', { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`src/${d.name}/index.ts`))
    .map((d) => [`${d.name}/index`, `src/${d.name}/index.ts`]),
);

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.tsx'] }),
  ],
  build: {
    lib: { entry: { index: 'src/index.ts', ...componentEntries }, formats: ['es'] },
    cssCodeSplit: true,
    rollupOptions: {
      external: [/^react/, /^@jpm1475\//],
      plugins: [preserveDirectives()],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        // Emit `Button.css`, not `Button.module.css`: consumers' bundlers would treat an imported
        // `*.module.css` as a CSS module again (re-scoping class names or dropping the import).
        assetFileNames: (asset) =>
          (asset.names[0] ?? '[name]').endsWith('.module.css')
            ? asset.names[0].replace(/\.module\.css$/, '.css')
            : '[name][extname]',
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.tsx'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
