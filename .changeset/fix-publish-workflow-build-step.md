---
"@deessejs/fp": patch
---

fix(ci): build before publish so the published tarball contains `dist/`

The `publish` job in `.github/workflows/publish.yml` runs `pnpm install` and immediately calls `pnpm changeset publish`. It does **not** run `pnpm build` first. The package's `files` allow-list in `package.json` includes `dist`, but `dist/` is the build output of `tsc` and does not exist at publish time — so npm packs only `README.md`, `CHANGELOG.md`, and `package.json`, with the `main` / `types` / `exports` fields pointing at files that are not in the tarball.

Result: every release published by this pipeline since the package was created (1.3.0, 2.0.0, 2.0.1, 5.0.0) has been a broken artifact. `import '@deessejs/fp'` from a consumer resolves to `ERR_MODULE_NOT_FOUND` because `./dist/index.js` does not exist in what they downloaded.

This affects PRs #442 (449), (450): the published versions are unusable. Consumers on the catalog bump break at runtime with a missing module. The first version that ships with the build step in place will be the first usable `@deessejs/fp` from this repository.

The fix is one line: add `pnpm --filter @deessejs/fp build` between `pnpm install` and `pnpm changeset publish`. The `validate` job already builds and smoke-tests `dist/`, so this just runs the same step again in the publish job so the artifact is fresh when packaged.

Cleanup action required separately by a maintainer with npm publish rights:

1. Unpublish the broken `@deessejs/fp@5.0.0` from the registry. It was published less than an hour ago, well inside the 72-hour `npm unpublish` window for versions that have not been depended on.
2. The next release (5.0.1) will be the first one consumers can actually use. The `pnpm pack @deessejs/fp@5.0.1 --dry-run` should show a non-empty `dist/` directory.