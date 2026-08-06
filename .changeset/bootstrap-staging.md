---
"@deessejs/fp": patch
---

Bootstrap changeset for the back-merge of main onto staging. The new release pipeline (5-job publish, changesets-version.yml, backmerge.yml, ci.yml with changeset-check) now lives on staging. This PR carries no functional change; the changeset exists solely to satisfy the per-PR Changeset rule.
After this PR merges, the Changeset file will be consumed by changesets-version.yml, producing a 1.1.3 patch entry (or whatever the next version is) that documents this bootstrap in the CHANGELOG.
