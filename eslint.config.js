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
    // eslint-config-expo 58 turned on the React Compiler rules as errors. Existing code predates
    // them; they warn (visible without --quiet) and are fixed file by file, not in one sweep.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    // expo-notifications re-exports its Android enums in a way eslint-plugin-import cannot follow;
    // TypeScript resolves them (pnpm compile).
    files: ['src/services/notifications/*.ts', 'src/services/safety/trip.ts'],
    rules: { 'import/namespace': 'off' },
  },
  {
    ignores: ['dist/*', 'android/*', 'ios/*', 'modules/*/android/*', 'modules/*/ios/*'],
  },
]);
