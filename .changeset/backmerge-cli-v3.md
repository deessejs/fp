---
"@deessejs/fp": patch
---

Back-merge of main to staging, bringing the changesets CLI v3 upgrade (PR #400) onto staging. The CLI was bumped from 2.31.0 to 3.0.0-next.5 to be compatible with changesets/action@v2.0.0-next.4. With this, the changesets-version.yml workflow should now run end-to-end and open a Version Packages PR against main on the next staging push.
