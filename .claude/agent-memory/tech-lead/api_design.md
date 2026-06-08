---
name: API Design Rule
description: Public API uses functions, not classes. Internal implementation can use classes.
type: feedback
---

**Rule:** Public API end user must use functions, not classes.

**Why:** Simpler mental model for users. `queue()` instead of `new Queue()`, `context()` instead of `new Context()`, etc.

**How to apply:**
- Public API: functions like `queue()`, `context()`, `sequence()`, `collection()`
- Internal implementation: can use classes for Ok, Err, Some, None, etc.
- Documentation examples: use function form, not `new ClassName()`
- API Reference section: show interfaces and functions, not class definitions

**Examples:**
```typescript
// ✅ Correct (function)
const q = queue({ concurrency: 3 });
const c = context().push({ key: 'value' });
const s = sequence.from([1, 2, 3]);

// ❌ Wrong (class constructor)
const q = new Queue({ concurrency: 3 });
const c = new Context().push({ key: 'value' });
```
