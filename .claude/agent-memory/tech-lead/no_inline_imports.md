---
name: No Inline Imports
description: Inline import types are forbidden in type definitions
type: feedback
---

# No Inline Imports

**Rule:** Do not use inline `import` statements in type definitions.

**Why:** Inline imports clutter the type definitions, make refactoring harder, and reduce readability.

**How to apply:** Always import types at the top of the file. Never use `import('../module').Type` inline in interfaces.

**Bad:**
```typescript
export interface Err {
  toMaybe(): import('../maybe/types').Maybe<T>;  // FORBIDDEN
}
```

**Good:**
```typescript
import type { Maybe } from '../maybe/types';

export interface Err {
  toMaybe(): Maybe<T>;
}
```