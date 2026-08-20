---
"@deessejs/fp": patch
---

Added a Vale-based prose lint job for the public documentation site (`apps/web/content`). The job runs only on PRs that touch the documentation and lints MDX files against a project vocabulary and the `Vale` and `proselint` styles.
