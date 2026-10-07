---
'@deessejs/fp': major
---

chore(release): 5.0.0 — reset published version above the prior npm history

The 1.x and 2.x on the npm registry were published from a related but separate codebase. This release publishes the current state of the `main` branch (the result of merging #442, #443, #444, #447, #448, #449) as 5.0.0, so the npm package now reflects this repository for the first time.

The 1.x, 2.0.0, 3.x, and 4.x on npm are preserved; this release does not unpublish them. Consumers pinning prior majors keep their current install. New consumers install `@deessejs/fp@5.0.0`.

This is a major because the public API of `poll` and the `Result` / `Maybe` shape landed in earlier (unpublished) 2.0.0 work, and the package now skips directly to 5.0.0 to clear the version space.
