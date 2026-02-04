import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    pool: 'forks',
    include: ['test/unit/**/*.test.ts'],
    exclude: ['test/integration/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/note-utils.ts', 'lib/session.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/types.ts'],
      thresholds: {
        lines: 95,
        functions: 100,
        branches: 100,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
