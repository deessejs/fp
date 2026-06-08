# @deessejs/fp

Functional Programming Utilities for TypeScript

`@deessejs/fp` provides lightweight, type-safe functional programming utilities. Built for simplicity and first-class integration with `@deessejs/errors`.

## Installation

```bash
npm install @deessejs/fp @deessejs/errors
```

```bash
pnpm add @deessejs/fp @deessejs/errors
```

## Quick Start

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

## Result

`Result<T, E>` represents a computation that can succeed (`Ok`) or fail (`Err`).

```typescript
import { ok, err, Result } from '@deessejs/fp';

// Create
const success = ok(10);
const failure = err('something went wrong');

// Transform
ok(10)
  .map(x => x * 2)           // Ok(20)
  .filter(x => x > 5)         // Ok(20)
  .flatMap(x => ok(x + 1));  // Ok(21)

// Handle errors
err('error')
  .mapError(e => new Error(e))  // Err(Error)
  .map(x => x * 2);             // Err(Error) - unchanged

// Extract value
ok(10).getOrElse(0);           // 10
err('error').getOrElse(0);      // 0
ok(10).getOrNull();             // 10
err('error').getOrNull();       // null

// Pattern matching
ok(10).match({
  ok: (v) => `Got ${v}`,
  err: (e) => `Error: ${e}`,
}); // "Got 10"
```

### Error Handling with @deessejs/errors

```typescript
import { ok, err, mapError } from '@deessejs/fp';
import { error, is } from '@deessejs/errors';

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

async function getUser(id: string) {
  if (!id) {
    return err(ValidationError({ reason: 'ID required' }));
  }
  const user = await db.find(id);
  if (!user) {
    return err(ValidationError({ reason: 'Not found' }));
  }
  return ok(user);
}

const result = await getUser('123');
if (result.isErr() && is(result.error, ValidationError)) {
  console.log(result.error.fields.reason);
}
```

## Maybe

`Maybe<T>` represents a value that may or may not exist (`Some` or `None`).

```typescript
import { some, none, maybe } from '@deessejs/fp';

// Create
some(10);              // Some(10)
none;                   // None
maybe(null);            // None
maybe(undefined);       // None
maybe(10);              // Some(10)

// Transform
some(10)
  .map(x => x * 2)      // Some(20)
  .filter(x => x > 5)   // Some(20)
  .flatMap(x => some(x + 1)); // Some(21)

// Safe property access
maybe(user?.address?.city); // Maybe<string>

// Extract value
some(10).getOrElse(0);      // 10
none.getOrElse(0);           // 0
some(10).getOrNull();        // 10
none.getOrNull();            // null
none.getOrThrow();           // throws Error

// Convert to Result
some(10).toResult('error');  // Ok(10)
none.toResult('error');      // Err('error')
```

## Unit

`Unit` represents the absence of a meaningful return value for side-effect functions.

```typescript
import { unit, isUnit, some, none } from '@deessejs/fp';

function log(message: string): typeof unit {
  console.log(message);
  return unit;
}

// Type guard
isUnit(unit);        // true
isUnit(null);        // false
isUnit(undefined);   // false
```

## API Reference

### Result

| Function | Description |
|----------|-------------|
| `ok(value)` | Create successful result |
| `err(error)` | Create failed result |

| Method | Description |
|--------|-------------|
| `map(fn)` | Transform the value |
| `flatMap(fn)` | Chain computations |
| `mapError(fn)` | Transform the error |
| `filter(predicate)` | Filter with predicate |
| `tap(fn)` | Execute side effect |
| `match({ ok, err })` | Pattern matching |
| `fold(okFn, errFn)` | Fold to value |
| `getOrElse(default)` | Get value or default |
| `getOrNull()` | Get value or null |
| `getOrUndefined()` | Get value or undefined |
| `getOrThrow()` | Get value or throw |
| `toMaybe()` | Convert to Maybe |
| `isOk()` | Type guard |
| `isErr()` | Type guard |

### Maybe

| Function | Description |
|----------|-------------|
| `some(value)` | Create present value |
| `none` | Create absent value |
| `maybe(value)` | Wrap nullable value |

| Method | Description |
|--------|-------------|
| `map(fn)` | Transform the value |
| `flatMap(fn)` | Chain computations |
| `filter(predicate)` | Filter with predicate |
| `filterMap(fn)` | Filter and map |
| `tap(fn)` | Execute side effect |
| `match({ some, none })` | Pattern matching |
| `fold(someFn, noneFn)` | Fold to value |
| `getOrElse(default)` | Get value or default |
| `getOrNull()` | Get value or null |
| `getOrUndefined()` | Get value or undefined |
| `getOrThrow()` | Get value or throw |
| `get(key)` | Safe property access |
| `toResult(error)` | Convert to Result |
| `toArray()` | Convert to array |
| `isSome()` | Type guard |
| `isNone()` | Type guard |

### Unit

| Function | Description |
|----------|-------------|
| `unit` | The singleton Unit value |
| `isUnit(value)` | Check if value is Unit |

## License

MIT
