---
"@deessejs/fp": patch
---

Back-merge of main to staging, bringing the publish.yml detect logic fix from PR #405. The detect job now uses --output JSON to count releases, so it correctly returns false when there are no changesets (e.g. on the merge commit of a Version Packages PR). The backmerge.yml now fetches origin/staging before reading it. After this lands, the pipeline should not regress on the next release.
