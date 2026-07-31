---
'@deessejs/fp': patch
---

Fix: emit explicit `.js` extensions on relative imports in the published `dist/` so Node ESM consumers (strict mode) can resolve them. This unblocks Vitest and other test runners that don't bundle on import.

Switches `packages/fp/tsconfig.json` to `module: NodeNext` + `moduleResolution: NodeNext` and updates source-level relative imports to include the `.js` suffix, as recommended by the TypeScript team for dual ESM/CJS packages.