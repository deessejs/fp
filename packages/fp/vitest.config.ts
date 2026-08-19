import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Tests at packages/fp/tests/* import the package as '@deessejs/fp'
// (per the published-style import). For dev tests we want to resolve
// that import to the source (not the dist build). The workspace
// pnpm symlink is in node_modules/@deessejs/fp -> packages/fp, so the
// package's package.json#exports.import maps '.' to './dist/index.js',
// which only exists after `pnpm build`. Resolve it to the source
// for tests, then the regular build pipeline resolves it back to dist.
const packageRoot = resolve(__dirname);
const sourceEntry = resolve(packageRoot, 'src/index.ts');

export default defineConfig({
  resolve: {
    alias: {
      '@deessejs/fp': sourceEntry,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/types.ts',
        'src/**/internal/index.ts',
        'src/**/*-class.ts',
        'src/index.ts',
      ],
      reporter: ['text-summary', 'html', 'lcov', 'json', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 99,
        branches: 90,
        functions: 100,
        statements: 99,
        perFile: false,
      },
    },
  },
});
