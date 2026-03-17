/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // Use node for all tests (no CORS issues)
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.ts'],
    testTimeout: 120000,
    hookTimeout: 120000,
    env: {
      NODE_ENV: 'test'
    },
    // Debugging configuration
    pool: process.env.NODE_ENV === 'debug' ? 'forks' : 'threads',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/**',
        'lib/**',
        'coverage/**',
        '**/*.test.ts',
        '**/test/**',
        'vitest.config.ts',
        'eslint.config.mjs',
        '**/*.d.ts',
        'src/types/**/*.ts',
        'src/itwins-client.ts',
        '.changeset/**'
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80
      }
    }
  },
  define: {
    global: 'globalThis',
  }
});