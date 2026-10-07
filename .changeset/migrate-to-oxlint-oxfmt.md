---
'@deessejs/fp': minor
---

chore: migrate lint and format from ESLint and Prettier to oxlint and oxfmt

Replaces the ESLint flat config in `packages/fp/eslint.config.js` and `apps/web/eslint.config.mjs` and the root `.prettierrc` with a single oxlint + oxfmt setup.

- Adds `oxlint@^1.87` and `oxfmt@^0.72` as root dev dependencies.
- Removes `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-next`, and the implicit `prettier` invocation.
- New root configs: `.oxlintrc.json` (with `extends` from each workspace) and `.oxfmtrc.json` (migrated from `.prettierrc` via `oxfmt --migrate prettier`).
- Per-workspace configs at `packages/fp/.oxlintrc.json` and `apps/web/.oxlintrc.json`. The web app finally gets a real `lint` script (it previously depended on `eslint-config-next` without one).
- Scripts: root `format` and `format:check` now use `oxfmt`; per-workspace `lint` and `lint:fix` use `oxlint`.
- Husky pre-commit now runs `pnpm format:check` so formatting drift is caught on commit.

This is a developer-tooling change only. The published `@deessejs/fp` artifact, the public API, and the runtime behavior are unchanged.

One real source fix was required: a stray Windows-1252 em-dash (0x97) in `docs/internal/product/features/result.md` was incompatible with the strict UTF-8 parser in oxfmt and has been replaced with the proper UTF-8 em-dash. The file rendered correctly in every browser and editor before, but the byte was technically invalid.
