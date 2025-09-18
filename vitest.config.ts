import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
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