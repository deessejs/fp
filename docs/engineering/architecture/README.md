# Architecture

This folder mirrors the architecture rules and decision records used across the `@deessejs/*` packages. It is a local, version-controlled copy of the upstream source so contributors can review them without leaving the workspace.

**Upstream source:** [`deessejs/errors`](https://github.com/deessejs/errors/tree/staging/docs/engineering/architecture) on the `staging` branch.

The two subfolders:

- [`rules/`](./rules/) — standing, always-on architectural constraints. Every PR must respect them.
- [`decisions/`](./decisions/) — Architecture Decision Records (ADRs). Each captures one significant choice, its context, and its consequences.

## Scope

This repository (`@deessejs/fp`) shares the same rule set as the upstream `@deessejs/errors` package. The local copy is the contract every contributor reviews against; the upstream is the canonical source for any disagreement.

When a rule is updated upstream, the change is propagated here in the same PR that bumps the rule. The local copy and the upstream reference the same `NNNN` sequence numbers.
