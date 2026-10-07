---
"@deessejs/fp": patch
---

fix(ci): stop publish.yml from treating any package.json change as a release

The `detect` job in `.github/workflows/publish.yml` previously
triggered a release whenever `packages/fp/package.json` changed in
`HEAD~1..HEAD`. Any fix PR that happened to touch `package.json` (for
example, to add a `files` field, or to update a dev dependency entry)
was misread as a version bump, and the workflow then tried to publish
the current `package.json#version` to npm. The anti-republish guard
in `validate` would refuse if that version was already live, otherwise
the workflow would publish a release with an empty changelog and a
half-baked version that had not gone through `changesets-version.yml`.

A legitimate release commit — produced by `changesets-version.yml` and
merged into `main` — has both:

- one or more changeset files removed under `.changeset/`
  (excluding `config.json` and `README.md`, which are not changesets)
- the `version` field of `packages/fp/package.json` strictly
  greater than in `HEAD~1`

Require both. The change is verified locally against five scenarios
(real release, fix PR touching package.json, orphan changeset
deletion, manual version bump, and major release) and the detector
returns the expected result in every case.
