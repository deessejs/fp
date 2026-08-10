---
"@deessejs/fp": patch
---

Full end-to-end test of the release pipeline. Validates that changesets-version.yml opens a Version Packages PR against main after this changeset is merged into staging, that publish.yml runs end-to-end and publishes 1.1.3 to npm via Trusted Publishing (OIDC), and that backmerge.yml opens a backmerge PR from main to staging.
No functional change to the library.
