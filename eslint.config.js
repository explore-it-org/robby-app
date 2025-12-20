// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'docs/legacy-src/**/*', 'node_modules/*'],
  },
  {
    rules: {
      // Disable unresolved import errors for react-native modules
      // as they're resolved at runtime by the React Native bundler
      'import/no-unresolved': ['error', { 
        ignore: ['^react-native', '^@react-native'] 
      }],
    },
  },
]);
