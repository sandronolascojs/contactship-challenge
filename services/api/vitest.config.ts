import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.e2e-spec.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
