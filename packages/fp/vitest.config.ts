import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        // Type-only files have no runtime.
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/types.ts',
        // Re-export barrels have no body.
        'src/**/internal/index.ts',
        // Sealed classes are tested through the public factories
        // (rule 0014 forbids importing them through the public API).
        'src/**/*-class.ts',
        // The barrel that re-exports the public surface.
        'src/index.ts',
      ],
      // json-summary emits packages/fp/coverage/coverage-summary.json
      // which the workflow's render-coverage.mjs reads to build the
      // PR comment. The other reporters (text, html, lcov) are kept
      // for local dev and the artifact upload.
      reporter: ['text-summary', 'html', 'lcov', 'json', 'json-summary'],
      reportsDirectory: './coverage',
      // Threshold gate is intentionally disabled in this PR. The full
      // method × variant test matrix lives in tests/ (a follow-up PR).
      // This PR adds the coverage reporter and the artifact upload but
      // does not enforce 100% yet — the gate would block on missing
      // tests rather than accelerate alignment with the ADR.
      thresholds: {
        lines: 0,
        branches: 0,
        functions: 0,
        statements: 0,
        perFile: false,
      },
    },
  },
});
