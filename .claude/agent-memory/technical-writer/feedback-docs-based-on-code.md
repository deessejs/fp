---
name: feedback-docs-based-on-code
description: Documentation must be based only on existing code, not product specs
type: feedback
---

**Rule:** Always base documentation on **existing code**, not on product docs or specs.

**Why:** Product docs can describe features that don't exist yet. Only the code tells the truth.

**How to apply:** When documenting a package, always read `src/` first. Use product docs (`docs/internal/product/`) as reference examples, but verify every method, signature, and behavior against the actual implementation.

In this session: the product docs described ~15 features but only 4 were implemented (Result, Maybe, Unit, type utilities). Doc was scoped to what actually exists.