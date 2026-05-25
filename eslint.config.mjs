// eslint.config.mjs
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import mantineConfig from 'eslint-config-mantine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  // Ignore build outputs
  {
    ignores: ['node_modules', '.next', 'out', 'dist', 'coverage', '.turbo'],
  },

  // Fix tsconfigRootDir for config files (must be before Mantine config)
  {
    files: ['*.{c,m}js', '**/*.config.{c,m}js', 'eslint.config.mjs'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },

  // Mantine ESLint configuration
  ...mantineConfig,

  // Basic JS recommendations
  js.configs.recommended,

  // TypeScript – basic recommendations (without type-checking) for all files
  ...tseslint.configs.recommended,

  // Next.js Core Web Vitals (important for Next projects)
  nextPlugin.configs['core-web-vitals'],

  // TypeScript – type-checked recommendations (only for TS files)
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // --- Code quality (TypeScript) ---
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {checksVoidReturn: {attributes: false}},
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {prefer: 'type-imports', fixStyle: 'inline-type-imports'},
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/array-type': ['warn', {default: 'array-simple'}],
      '@typescript-eslint/restrict-template-expressions': 'error',

      // --- Unused imports (TypeScript) ---
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],

      // --- Import order (cleaner diffs) (TypeScript) ---
      'import/order': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },

  // Allow JS in config files without TypeScript project settings
  {
    files: ['*.{c,m}js', '**/*.config.{c,m}js'],
    languageOptions: {
      parserOptions: {
        project: null,
        tsconfigRootDir: __dirname,
      },
    },
  },
  // Disable rules for automatically generated Next.js files (TypeScript)
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    plugins: {prettier: prettierPlugin},
    rules: {
      'prettier/prettier': ['warn'],
    },
  },
  prettierConfig, // disable conflicting ESLint rules
];
