const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const testingLibrary = require('eslint-plugin-testing-library');
const jestPlugin = require('eslint-plugin-jest');
const globals = require('globals');

module.exports = [
  { ignores: ['build/', 'node_modules/'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat['recommended-latest'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
      jest: { version: 29 },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^React$', caughtErrors: 'none' }],
      'react/prop-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/setupTests.{js,jsx}', '**/__tests__/**'],
    ...testingLibrary.configs['flat/react'],
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/setupTests.{js,jsx}', '**/__tests__/**'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/no-conditional-expect': 'warn',
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/setupTests.{js,jsx}', '**/__tests__/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        global: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-empty': 'off',
      'react/display-name': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^React$', caughtErrors: 'none' }],
    },
  },
  {
    files: ['**/__mocks__/**'],
    languageOptions: {
      globals: {
        module: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
