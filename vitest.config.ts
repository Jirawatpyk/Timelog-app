import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local for tests
dotenv.config({ path: '.env.local' });

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // Run E2E tests sequentially to avoid database conflicts
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    // Include test files in src/ and test/
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test'),
    },
    // Ensure React dev mode is used for testing
    conditions: ['development', 'browser'],
  },
  define: {
    // Force development mode for React
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
});
