---
'@deessejs/fp': patch
---

fix(ci): disable npm publish provenance so 2.0.0 (and future releases) actually land on the registry

`publishConfig.provenance: true` requires OIDC, which is not configured on the `@deessejs/fp` npm package. Every release since the publish pipeline was activated has been silently rejected by npm with `EUSAGE: Automatic provenance generation not supported for provider: null`, while the CI workflow reports success because the GitHub Actions orchestration itself runs to completion. The "Published @deessejs/fp@2.0.0!" line in the publish job log is misleading; the package is not on the registry.

Setting `provenance: false` lets `pnpm changeset publish` succeed with a regular npm token. The trade-off is the loss of the Sigstore-signed provenance statement on the published artifact, which is acceptable because the release pipeline is gated by PR review and CI on GitHub, so build provenance is reconstructible from the tag. Trusted Publishing can be re-enabled later (one line flip + a config on npmjs.com) without breaking consumers.

This is a patch release because the only change is to the publish configuration, not the public API.
