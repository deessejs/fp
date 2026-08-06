---
"@deessejs/fp": patch
---

End-to-end test of the new release pipeline on staging after the back-merge. This PR validates that changeset-check passes, that changesets-version.yml opens the Version Packages PR against main on merge, that publish.yml runs end-to-end, and that backmerge.yml keeps staging in sync.
No functional change to the library.
