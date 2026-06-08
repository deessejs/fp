# @deessejs/fp

Functional Programming Utilities for TypeScript

`@deessejs/fp` provides lightweight, type-safe functional programming utilities. Built for simplicity and first-class integration with `@deessejs/errors`.

## Packages

| Package | Description |
|---------|-------------|
| [`packages/fp`](./packages/fp/) | Core FP utilities: Result, Maybe, Unit |
| [`apps/web`](./apps/web/) | Documentation site |

## Packages

### @deessejs/fp

```bash
npm install @deessejs/fp @deessejs/errors
```

```typescript
import { ok, err, some, none, maybe } from '@deessejs/fp';

// Result - handle errors explicitly
const divide = (a: number, b: number) =>
  b === 0 ? err('Division by zero') : ok(a / b);

const result = divide(10, 2);
result.match({
  ok: (value) => console.log(`Result: ${value}`),
  err: (error) => console.error(`Error: ${error}`),
});

// Maybe - handle optional values safely
const user = { name: 'Alice', address: { city: 'Paris' } };
const city = maybe(user.address?.city)
  .map(c => c.toUpperCase())
  .getOrElse('Unknown');
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

## Available Scripts

### Workspace (root)

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |

### Package: fp

```bash
pnpm --filter @deessejs/fp build         # Build the package
pnpm --filter @deessejs/fp test          # Run tests (watch mode)
pnpm --filter @deessejs/fp test:run      # Run tests (single run)
pnpm --filter @deessejs/fp type-check    # TypeScript type checking
pnpm --filter @deessejs/fp lint          # Run ESLint
```

### App: web

```bash
pnpm --filter web dev      # Start development server
pnpm --filter web build   # Build for production
pnpm --filter web lint    # Run ESLint
```

## CI/CD

Each package has its own GitHub Actions workflows in `.github/workflows/`:

| Workflow | Description |
|----------|-------------|
| Lint | Runs ESLint |
| Type Check | Runs TypeScript type checking |
| Tests | Runs Vitest |
| Build | Builds the package/app |

## Tech Stack

- **Package Manager**: pnpm
- **Build Tool**: Turborepo
- **Language**: TypeScript
- **Testing**: Vitest
- **Linting**: ESLint
- **App Framework**: Next.js (React)
