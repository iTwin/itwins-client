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
    testTimeout: 60000,
    hookTimeout: 60000,
    env: {
      NODE_ENV: 'test'
    },
    // Debugging configuration
    pool: process.env.NODE_ENV === 'debug' ? 'forks' : 'threads',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  },
  define: {
    global: 'globalThis',
  }
});