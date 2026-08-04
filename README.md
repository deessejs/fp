<p align="center">
  <h1 align="center">@deessejs/fp</h1>
</p>

<p align="center">
  <strong>Lightweight, type-safe functional programming utilities for TypeScript.</strong>
  Result, Maybe, Try, Unit, and friends — ESM-only, no runtime dependencies, designed for first-class interoperability with <a href="https://github.com/deessejs/errors">@deessejs/errors</a>.
</p>

<p align="center">
  <a href="https://github.com/deessejs/fp/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/deessejs/fp" alt="License">
  </a>
  <a href="https://github.com/deessejs/fp/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/deessejs/fp/ci.yml?label=CI" alt="CI">
  </a>
  <a href="https://github.com/deessejs/fp/stargazers">
    <img src="https://img.shields.io/github/stars/deessejs/fp?style=social" alt="Stars">
  </a>
  <a href="https://www.npmjs.com/package/@deessejs/fp">
    <img src="https://img.shields.io/npm/v/@deessejs/fp?color=brightgreen" alt="npm">
  </a>
</p>

<p align="center">
  <a href="https://fp.deessejs.com">
    <img src="https://img.shields.io/badge/docs-fp.deessejs.com-blue" alt="Documentation">
  </a>
</p>

> **Sibling projects:** [`@deessejs/errors`](https://github.com/deessejs/errors) provides error types that integrate natively with `@deessejs/fp`'s `Result` and `Try`. Install them together to get a complete error-handling story without glue code.

---

## What's included

| Layer | What you get | Why it matters |
|---|---|---|
| **`Result<T, E>`** | `ok`, `err`, pattern matching, sequencing | Type-safe error handling without exceptions or nulls. |
| **`Maybe<T>`** | `some`, `none`, `maybe`, `map`, `getOrElse` | Optional values that compose. |
| **`Try<T>`** | `try`, `tryAsync`, conversion to `Result` | Wrap throwing functions in a typed shell. |
| **`Unit`** | The unit type for void-returning operations | Express "no value" without `null` or `undefined`. |
| **Functional utilities** | `pipe`, `flow`, `identity`, `constant`, `flip`, `tupled` | Compose functions without ad-hoc helpers. |
| **Async utilities** | `sleep`, `retry`, `timeout`, `Queue` | Time-based primitives that compose with `Result`. |
| **Predicate utilities** | `Predicate`, `Refinement`, `not`, `and`, `or` | First-class predicates and type guards. |
| **Collection types** | `Context`, `Sequence`, `Collection`, async iterator helpers | Sequence operations over various sources. |
| **Generator composition** | `gen()` with `yield*` | Async flow control that reads like sync code. |
| **[`@deessejs/errors`](https://github.com/deessejs/errors) integration** | All `Result` constructors accept `@deessejs/errors` | No string-error footguns — use real error types. |

## Why this stack

- **Simple by default.** No over-engineering, no fancy type gymnastics. Just the primitives you need to write cleaner code.
- **ESM-only.** Modern packaging, no CJS shim, no `module`/`main` duplication.
- **Zero runtime dependencies.** The only peer dep is [`@deessejs/errors`](https://github.com/deessejs/errors), which is opt-in. The library itself is dependency-free.
- **TypeScript 6 first-class.** Strict types, no `any` leakages, full inference. JSDoc where types alone are not enough.
- **Lockfile-clean pnpm workspaces.** A single `pnpm install` rebuilds, lints, types, and tests the whole monorepo.
- **Real testing.** Vitest, with coverage and integration tests against [@deessejs/errors](https://github.com/deessejs/errors).

## Quick start

### Prerequisites

- Node.js **22.14.0+** (`engines.node` enforced)
- pnpm **10+** for development (`corepack enable` if not installed)
- TypeScript **6+** for consumers (the package emits `dist/*.d.ts`)

### Install

```bash
# Install @deessejs/fp with its optional sibling, @deessejs/errors.
# See https://github.com/deessejs/errors
npm install @deessejs/fp @deessejs/errors
```

[`@deessejs/errors`](https://github.com/deessejs/errors) is optional — install it if you want `Result<T, E>` to carry typed errors instead of strings.

### Usage

```typescript
import { ok, err, some, none, maybe, pipe } from '@deessejs/fp';

// Result: represent values that may have failed
const divide = (a: number, b: number) =>
  b === 0 ? err('Division by zero') : ok(a / b);

const result = divide(10, 2);
result.match({
  ok: (value) => console.log(`Result: ${value}`),
  err: (error) => console.error(`Error: ${error}`),
});

// Maybe: represent optional values
const user = { name: 'Alice', address: { city: 'Paris' } };
const city = maybe(user.address?.city)
  .map((c) => c.toUpperCase())
  .getOrElse('Unknown');

// pipe: compose functions without glue
const trim = (s: string) => s.trim();
const uppercase = (s: string) => s.toUpperCase();
const processed = pipe('  hello  ', trim, uppercase);
```

### Engine compatibility

| Runtime | Minimum version |
|---|---|
| Node.js | 22.14.0 |
| pnpm | 10 (for development) |
| TypeScript | 6.0 |

ESM-only. Consumers using a CJS resolver need to use dynamic `import()` or migrate to ESM.

## Available commands

### Workspace (root)

| Command | What it does |
|---|---|
| `pnpm build` | Build every workspace |
| `pnpm test` | Run all tests in watch mode |
| `pnpm test:run` | Run all tests once |
| `pnpm lint` | Lint every workspace |
| `pnpm type-check` | Type-check every workspace |
| `pnpm format` | Format with Prettier |

### Package: `@deessejs/fp`

| Command | What it does |
|---|---|
| `pnpm --filter @deessejs/fp build` | Build `dist/` |
| `pnpm --filter @deessejs/fp test` | Run vitest in watch mode |
| `pnpm --filter @deessejs/fp test:run` | Run vitest once |
| `pnpm --filter @deessejs/fp type-check` | `tsc --noEmit` |
| `pnpm --filter @deessejs/fp lint` | Run ESLint |

### App: `web`

| Command | What it does |
|---|---|
| `pnpm --filter web dev` | Start the docs site in dev mode |
| `pnpm --filter web build` | Build the docs site |

## Compatibility

### Peer dependencies

| Package | Required | Notes |
|---|---|---|
| [`@deessejs/errors`](https://github.com/deessejs/errors) | Optional, peer `>=1.0.0` | Required if you want `err()` to accept typed errors. Listed as a `devDependency` for testing. |

### Engines

| Field | Value |
|---|---|
| `engines.node` | `>=22.14.0` |
| `packageManager` | `pnpm@10.30.3` |

## Project structure

```
.
├── packages/
│   └── fp/                # The library — @deessejs/fp on npm
│       ├── src/           # Source code (ESM)
│       ├── dist/          # Build output (gitignored)
│       ├── vitest.config.ts
│       └── tsconfig.build.json
├── apps/
│   └── web/               # Documentation site (Next.js + Fumadocs)
├── docs/
│   ├── internal/          # Engineering plans, runbooks
│   │   ├── product/
│   │   └── versions/
│   └── CLAUDE.md          # Claude / agent guidance
├── pnpm-workspace.yaml
├── turbo.json             # Turborepo pipelines
├── .changeset/            # Changesets for versioning
└── README.md
```

## Publishing

Releases are fully automated via Changesets + npm Trusted Publishing (OIDC). No long-lived `NPM_TOKEN` is required.

| What | How |
|---|---|
| Bump version | Add a `.changeset/<topic>.md` file with semver + description |
| Open the release PR | `changesets-version.yml` opens / updates a "Version Packages" PR from staging to main |
| Publish | Merge the Version Packages PR → `publish.yml` runs → version bump committed → Trusted Publishing publishes to npm with provenance attestation |
| Hotfix | Push a tag `vX.Y.Z` to main → same workflow runs for the hotfix path |
| Rollback or deprecate | Planned: see `docs/engineering/plans/release-pipeline-github-ui-setup.md` |

For the full pipeline design, see [`docs/engineering/plans/release-pipeline.md`](docs/engineering/plans/release-pipeline.md).

## Architecture notes

- **ESM-only.** The package exports ES modules. Consumers using legacy CJS resolvers must use dynamic `import()`.
- **Strict types.** `Result.match` requires both branches; `Maybe.getOrElse` requires a fallback. No partial type escapes.
- **Composition over inheritance.** All primitives compose via `pipe` and `flow`. No class hierarchy, no `extends`.
- **Zero-runtime abstractions.** No decorators, no reflection, no proxy traps. The library is straightforward to read in DevTools and `node --prof`.
- **Smoke-tested before publish.** The release workflow runs a dynamic ESM import of the built artifact and verifies that key exports are present. A broken build fails the publish step before reaching npm.
- **[`@deessejs/errors`](https://github.com/deessejs/errors) is opt-in.** The peer dep stays optional so consumers can adopt `@deessejs/fp` in isolation. Once `@deessejs/errors` is added, every `err(error)` call accepts a typed error.
- **One source of truth for auth-style errors.** The `apps/app/proxy.ts` (in the broader deessejs monorepo, not in this repo) enforces email verification at the proxy level. [@deessejs/errors](https://github.com/deessejs/errors) errors are caught and translated to HTTP responses centrally.

## Contributing

Open an issue to discuss larger changes. For typos, broken links, and small fixes, PRs are welcome.

Before submitting a PR:

1. Run `pnpm --filter @deessejs/fp test:run` and `pnpm --filter @deessejs/fp lint`.
2. Add a `.changeset/<topic>.md` if the change is user-facing (patch / minor / major).
3. Update `docs/internal/product/README.md` if the API surface changes.

## License

[MIT](./LICENSE). See the LICENSE file for details.

## Support

- Issues: [github.com/deessejs/fp/issues](https://github.com/deessejs/fp/issues)
- Discussions: [github.com/deessejs/fp/discussions](https://github.com/deessejs/fp/discussions)
- Email: [hello@nesalia.com](mailto:hello@nesalia.com)
- Documentation: [fp.deessejs.com](https://fp.deessejs.com)
