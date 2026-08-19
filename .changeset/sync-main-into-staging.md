---
'@deessejs/fp': patch
---

chore(release): sync main into staging

Backports the CI/publish fixes from the 1.2.x release series and
commit `119b1e8` (architecture rules, `Ok.filter` contract, drop
dead dependency) into staging. No public API changes.

- The `Ok.filter(predicate, errorFn)` contract is now part of the
  release notes: when the predicate fails and an `errorFn` is
  supplied, the result is `Err(errorFn(value))`; without `errorFn`,
  the `Ok` passes through.
- Architecture rules mirrored in `src/index.ts` and the ADR pointer
  in `docs/engineering/architecture/decisions/`.
- Release pipeline fixes from `main` (idempotent tag creation,
  `resolve-version` quoting, `--provenance` removal, etc.) now
  ship from staging.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
