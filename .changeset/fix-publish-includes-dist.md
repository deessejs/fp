---
"@deessejs/fp": major
---

fix(fp): include `dist/` in the published tarball

The published `@deessejs/fp` tarball (1.2.0 and later, including 1.3.0) contained only 8 files — the source `.ts` files were excluded by `.npmignore` but the compiled `dist/` output was not whitelisted, so it was missing. Consumers who installed the package got `ERR_MODULE_NOT_FOUND` when importing, because `package.json` points `main` / `exports["."].import` to `./dist/index.js` which did not exist in the tarball.

Root cause: the previous `.npmignore` filtered out everything that should not ship (`src/`, `*.test.ts`, `*.config.ts`, …) but did not explicitly allow `dist/`. Since `dist/` is also gitignored, no rule kept it in the tarball.

Fix: replace the deny-list `.npmignore` with an explicit `files` allow-list in `package.json`:

```json
"files": [
  "dist",
  "README.md",
  "CHANGELOG.md",
  "LICENSE"
]
```

The `files` field has a safer failure mode than `.npmignore` — a missing entry fails loudly at install time (the consumer sees the broken import) rather than silently publishing unintended content. It is also unaffected by the interaction between `.gitignore` and `.npmignore`, which the npm CLI wiki lists among the "known issues" of the ignore-file approach.

Verified with `npm pack --dry-run` locally: the preview now includes `dist/index.js`, `dist/index.d.ts`, and the rest of the build output (114 files vs. 8 previously).
