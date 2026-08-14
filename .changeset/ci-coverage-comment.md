---
"@deessejs/fp": patch
---

Split the CI's "Test + coverage gate" job into two: a fast `test`
job and a `coverage` job that posts a sticky PR comment with the
per-file coverage table. No source-code changes. The coverage
threshold gate is disabled in this PR (lands with the test matrix
in a follow-up).
