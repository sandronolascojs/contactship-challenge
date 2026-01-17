import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/mastra/index.ts',
    'src/mastra/agents/index.ts',
    'src/mastra/scorers/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  shims: true,
  target: 'es2022',
  outDir: 'dist',
  esbuildOptions(options) {
    options.banner = {
      js: '// @ts-check',
    };
  },
});
