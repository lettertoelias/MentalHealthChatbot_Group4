import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // === Next.js base rules ===
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // === Custom ignores ===
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },

  // === Custom style rules ===
  {
    rules: {
      'comma-dangle': ['warn', 'always-multiline'],       // enforce for multiline objects/arrays
      'eol-last': ['warn', 'always'],                     // Enforce exactly one newline at EOF
      'jsx-quotes': ['warn', 'prefer-double'],            // Double quotes for JSX
      'object-curly-spacing': ['warn', 'always'],         // spacing / formatting consistency
      quotes: ['warn', 'single', { avoidEscape: true }],  // Single quotes for JS/TS
      semi: ['warn', 'never'],                            // No semicolons
    },
  },
]

export default eslintConfig
