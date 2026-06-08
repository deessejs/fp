---
name: Project Structure
description: Folder structure for @deessejs/fp packages
type: reference
---

# @deessejs/fp Package Structure

## Alpha.1 Structure (Result, Maybe, Unit)

Each group gets its own folder with separation of concerns:

```
src/
├── result/
│   ├── types.ts        # Ok, Err, Result interfaces
│   ├── constants.ts    # ok(), err() constructors
│   ├── builders.ts    # (empty for now, reserved for future)
│   └── index.ts
│
├── maybe/
│   ├── types.ts        # Some, None, Maybe interfaces
│   ├── constants.ts    # some(), none(), maybe() constructors
│   ├── builders.ts    # (empty for now, reserved for future)
│   └── index.ts
│
├── unit/
│   ├── types.ts        # Unit type
│   ├── constants.ts    # unit constant, isUnit()
│   └── index.ts
│
├── types.ts            # OkType, ErrType, SomeType, isResult(), isMaybe()
│
└── index.ts           # barrel: Result, Maybe, Unit + all exports
```

## File Purpose Guidelines

| File | Purpose |
|------|---------|
| `types.ts` | Interface definitions, type aliases |
| `constants.ts` | Constructor functions, constants |
| `builders.ts` | Complex factory functions (reserved) |
| `index.ts` | Re-exports for the group |

## Why This Structure

- **Grouping by concept** — Each type (Result, Maybe, Unit) is self-contained
- **Clear separation** — Easy to find where to add new functionality
- **Scalable** — Can add `methods.ts` or `functions.ts` later if needed
- **Dual API ready** — Instance methods in types.ts, pipeable functions can go in functions.ts
