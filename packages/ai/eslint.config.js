import base from '@contactship/config/eslint.base.js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'tsup.config.ts',
      'tsup.config.d.ts',
      'eslint.config.js',
      '**/tsup.config.ts',
      '**/tsup.config.d.ts',
    ],
  },
  ...base,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['tsup.config.ts', '*.config.ts', '*.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
