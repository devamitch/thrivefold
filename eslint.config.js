// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // React Native <Text> renders quotes/apostrophes literally; this rule targets HTML.
    rules: { 'react/no-unescaped-entities': 'off' },
  },
  {
    ignores: ['dist/*', 'android/*', 'ios/*', 'modules/*/android/*', 'modules/*/ios/*'],
  },
]);
