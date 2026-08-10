---
"@deessejs/fp": patch
---

Back-merge of main to staging, bringing the format: false fix from PR #402. Without this, changesets v3 tries to invoke prettier (not in devDependencies) and the format step fails. With format: false, the Version Packages PR pipeline runs end-to-end.
