import { dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  {
    ignores: [], // Need specify absolute path from root
  },
  {
    rules: {
      'no-unused-vars': 'off', // Note: you must disable the base rule as it can report incorrect errors
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-expressions': 'off', // Note: you must disable the base rule as it can report incorrect errors
      '@typescript-eslint/no-unused-expressions': 'off'
    },

  },

]);

export default eslintConfig;
