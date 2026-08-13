import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * Flat config. `next lint` is deprecated and removed in Next 16, so `npm run
 * lint` runs the ESLint CLI directly.
 *
 * `next/core-web-vitals` is the stricter of the two Next presets — it promotes
 * the performance rules from warning to error, which is the right default for a
 * site whose pitch includes a Lighthouse score.
 */
const config = [
  {
    ignores: [
      '.next/**',
      '.next-stub/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        URL: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
];

export default config;
