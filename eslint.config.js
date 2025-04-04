// eslint.config.js
import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import airbnbBase from 'eslint-config-airbnb-base';
import airbnbTypescript from 'eslint-config-airbnb-typescript';
import airbnbHooks from 'eslint-config-airbnb/rules/react-hooks';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'node_modules/',
      'dist/',
      'env.d.ts',
      '.env',
      '.env.*',
      'vite.config.ts',
      '*.codegen.tsx',
      '*.codegen.ts',
      '*.gen.*',
      '*.gen.ts',
      'abis/',
      // Previous ignores from your config
      'codegen.ts',
      '*.gen.*',
      '*.d.ts',
      'eslint.config.js',
    ],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.test.json'],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
      perfectionist: perfectionistPlugin,
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      '@tanstack/query': tanstackQueryPlugin,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      ...airbnbBase.rules,
      ...airbnbTypescript.rules,
      ...airbnbHooks.rules,
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...perfectionistPlugin.configs['recommended-alphabetical'].rules,
      ...prettierConfig.rules,
      ...tanstackQueryPlugin.configs.recommended.rules,

      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 'always',
          groups: [{ newlinesBetween: 'never' }],
        },
      ],
      'perfectionist/sort-interfaces': [
        'error',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          partitionByComment: true,
          groups: ['id', 'unknown'],
          customGroups: {
            id: 'id',
          },
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-namespace': 'off',
      'react/react-in-jsx-scope': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'no-param-reassign': 'off',
      'import/no-extraneous-dependencies': 'off',
      'react/jsx-props-no-spreading': 'off',
      'consistent-return': 'off',
      'react/require-default-props': 'off',
      'import/export': 'off',
      'import/no-cycle': 'warn',
      'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error'] }],
      'import/no-named-as-default': 0,
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-nested-ternary': 'off',
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',
      'no-restricted-syntax': ['off', 'ForOfStatement'],
    },
  },
];
