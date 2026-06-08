# Function Utilities

Lightweight function composition helpers.

## Installation

```typescript
import { pipe, flow, identity, constant, flip, tupled, untupled } from '@deessejs/fp';
```

## Real-World Examples

### pipe — Data Transformation Pipeline

```typescript
import { pipe } from '@deessejs/fp';

// Transform API response
const processUserResponse = pipe(
  JSON.parse,                          // string -> object
  (obj: unknown) => obj as User,       // type assertion
  (user: User) => ({                   // normalize
    ...user,
    email: user.email.toLowerCase(),
    createdAt: new Date(user.createdAt),
  }),
  (user: User) => ({                   // compute derived
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
  }),
);

// Build HTML safely
const sanitizeAndFormat = pipe(
  (str: string) => str.trim(),
  (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  (str: string) => str.replace(/\n/g, '<br>'),
  (str: string) => `<div class="content">${str}</div>`,
);

// Parse and validate URL
const parseUrl = pipe(
  (url: string) => new URL(url),
  (url: URL) => ({
    protocol: url.protocol.replace(':', ''),
    host: url.host,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  }),
);

// Multi-step calculation
const calculateOrderTotal = pipe(
  (items: OrderItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  (subtotal: number) => subtotal * 1.08, // Add tax
  (total: number) => Math.round(total * 100) / 100, // Round to 2 decimals
);
```

### flow — Create Reusable Functions

```typescript
import { flow } from '@deessejs/fp';

// Text processing pipeline
const normalizeText = flow(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/\s+/g, ' '),
);

const slugify = flow(
  normalizeText,
  (s: string) => s.replace(/[^a-z0-9]+/g, '-'),
  (s: string) => s.replace(/^-+|-+$/g, ''),
);

// Usage
slugify('  Hello World!  '); // 'hello-world'
slugify('What the heck??'); // 'what-the-heck'

// Validate and transform
const parseInteger = flow(
  (s: string) => parseInt(s, 10),
  (n: number) => isNaN(n) ? null : n,
);

const clamp = (min: number, max: number) => flow(
  (n: number) => Math.max(min, n),
  (n: number) => Math.min(max, n),
);

const clampBetween1And10 = clamp(1, 10);

// API response handler
const handleApiResponse = flow(
  (res: Response) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  (data: unknown) => data as ApiResponse,
  (data: ApiResponse) => {
    if (data.error) throw new Error(data.error);
    return data;
  },
);

// Compose validators
const isNonEmpty = (s: string) => s.length > 0;
const isValidEmail = (s: string) => s.includes('@');
const isLongEnough = (s: string) => s.length >= 8;

const validatePassword = flow(
  (s: string) => [isNonEmpty, isLongEnough].every(v => v(s)),
  valid => valid ? s : null,
);
```

### identity — Default Values & Placeholders

```typescript
import { identity } from '@deessejs/fp';

// Default value helper
const withDefault = <T>(fallback: T) => (value: T | null | undefined): T =>
  value ?? fallback;

const config = withDefault('default');

// Optional mapping
const maybeMap = <T, R>(
  fn: (value: T) => R
) => (value: T | null): R | null =>
  value ? fn(value) : null;

const upperEmail = maybeMap(s => s.toUpperCase());

// Identity in generics
const createLogger = <T>(message: string, value: T): T => {
  console.log(message, value);
  return value;
};

// Use with reduce
const numbers = [1, 2, 3, 4, 5];
numbers.reduce((acc, n) => acc + n, 0); // identity as initial value

// Functional set default
const setDefault = (key: string, value: unknown) =>
  (obj: Record<string, unknown>) =>
    key in obj ? obj : { ...obj, [key]: value };

// Pipeline with optional step
const maybeProcess = (shouldProcess: boolean) =>
  shouldProcess
    ? (fn: (x: string) => string) => fn
    : identity;
```

### constant — Memoization & Caching

```typescript
import { constant } from '@deessejs/fp';

// Constant config values
const DEFAULT_PAGE_SIZE = constant(20);
const MAX_RETRY_ATTEMPTS = constant(3);
const DEFAULT_TIMEOUT = constant(5000);

// Use in Result transformations
const toDefault = constant(ok({ default: true }));
const toError = constant(err('Invalid input'));

ok(value)
  .filter(predicate)
  .orElse(() => toDefault()); // Returns default on failure

// Lazy evaluation
const expensiveComputation = constant(computeExpensiveValue());

// Use with tap for logging
ok(user)
  .tap(user => console.log('User:', user.name))
  .map(user => ({ ...user, processed: true }));

// Reusable placeholder
const alwaysTrue = constant(true);
const alwaysFalse = constant(false);
const alwaysNull = constant(null);
const alwaysEmpty = constant([]);
```

### flip — Swap Arguments

```typescript
import { flip } from '@deessejs/fp';

// Subtract in reverse order
const subtract = (a: number, b: number) => a - b;
const subtractFrom = flip(subtract);

subtract(5, 3);   // 2 (5 - 3)
subtractFrom(5, 3); // -2 (3 - 5)

// Use with sort
const users = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }];

// Sort by age ascending
users.sort((a, b) => a.age - b.age);

// Sort by age descending (flip the comparison)
users.sort(flip((a, b) => a.age - b.age));

// Object property access
const get = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];
const prop = <K extends string>(key: K) => (obj: Record<string, unknown>) => obj[key];

// Use in higher-order functions
const getProperty = flip(get);

// Map object to values
const mapValues = <K extends string, V, R>(
  obj: Record<K, V>,
  fn: (value: V) => R
): Record<K, R> => {
  const entries = Object.entries(obj) as [K, V][];
  return Object.fromEntries(
    entries.map(([k, v]) => [k, fn(v)])
  ) as Record<K, R>;
};

// Invert key-value mapping
const invertMap = <K extends string, V extends string>(
  obj: Record<K, V>
): Record<V, K> => {
  return Object.fromEntries(
    Object.entries(obj).map(flip)
  ) as Record<V, K>;
};
```

### tupled / untupled — Function Adapters

```typescript
import { tupled, untupled } from '@deessejs/fp';

// Use with array spread
const add = (a: number, b: number) => a + b;
const tupledAdd = tupled(add);

[1, 2].map(tupledAdd); // [3]

// Array to function
const sum = tupled((nums: number[]) => nums.reduce((a, b) => a + b, 0));

// Use with Array methods
const numbers = [[1, 2], [3, 4], [5, 6]];
numbers.map(tupled(add)); // [3, 7, 11]

// Convert callback-style to tuple-style
const withTimeout = tupled((fn: () => void, ms: number) => {
  setTimeout(fn, ms);
});

// Use in Result context
pipe(
  [minValue, maxValue],
  tupled((min, max) => validateRange(min, max)),
);

// Untuple for variadic functions
const makeQuery = untupled((table: string, conditions: string[]) =>
  `SELECT * FROM ${table} WHERE ${conditions.join(' AND ')}`
);

makeQuery('users', ['id = 1', 'active = true']);
// "SELECT * FROM users WHERE id = 1 AND active = true"

// Batch processing
const processBatch = tupled((items: Item[], options: Options) =>
  items.map(item => processItem(item, options))
);
```

## Composition Patterns

```typescript
import { pipe, flow } from '@deessejs/fp';

// Full pipeline example: API request -> validate -> transform -> store
const handleApiRequest = flow(
  // 1. Parse request body
  (body: string) => JSON.parse(body) as unknown,
  // 2. Validate structure
  (data: unknown) => validateUserInput(data),
  // 3. Normalize
  (user: UserInput) => ({
    email: user.email.toLowerCase().trim(),
    name: user.name.trim(),
    age: user.age ? Number(user.age) : undefined,
  }),
  // 4. Transform for storage
  (user: NormalizedUser) => ({
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: generateId(),
  }),
);

// Build validator from predicates
const composeValidator = (...predicates: Array<(v: string) => boolean>) =>
  (value: string) => {
    for (const predicate of predicates) {
      if (!predicate(value)) return false;
    }
    return true;
  };

const validatePassword = composeValidator(
  s => s.length >= 8,
  s => /[A-Z]/.test(s),
  s => /[0-9]/.test(s),
);

// Pipeline with branching
const processOrder = flow(
  // Extract and validate
  (order: unknown) => order as Order,
  // Apply business rules
  (order: Order) => ({
    ...order,
    discount: calculateDiscount(order),
    shipping: calculateShipping(order),
    tax: calculateTax(order),
  }),
  // Finalize
  (order: ProcessedOrder) => ({
    ...order,
    total: order.subtotal - order.discount + order.shipping + order.tax,
  }),
);
```

## API Reference

### pipe

Pipes a value through a chain of functions.

```typescript
function pipe<A>(value: A): A;
function pipe<A, B>(value: A, ab: (a: A) => B): B;
function pipe<A, B, C>(value: A, ab: (a: A) => B, bc: (b: B) => C): C;
// ... up to 16 arguments
```

### flow

Composes functions left-to-right. Returns a new function.

```typescript
function flow<A, B>(ab: (a: A) => B): (a: A) => B;
function flow<A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C;
function flow<A, B, C, D>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): (a: A) => D;
// ... up to 16 arguments
```

### identity

Returns its argument unchanged.

```typescript
function identity<A>(a: A): A;
```

### constant

Creates a function that always returns a given value.

```typescript
function constant<A>(value: A): () => A;
```

### flip

Swaps the arguments of a two-argument function.

```typescript
function flip<A, B, C>(f: (a: A, b: B) => C): (b: B, a: A) => C;
function flip<A, B, C>(f: (a: A) => (b: B) => C): (b: B) => (a: A) => C;
```

### tupled / untupled

Convert between tupled and curried function forms.

```typescript
function tupled<A extends ReadonlyArray<unknown>, B>(
  f: (...args: A) => B
): (args: A) => B;

function untupled<A extends ReadonlyArray<unknown>, B>(
  f: (args: A) => B
): (...args: A) => B;
```

### Other Utilities

```typescript
// Always returns false
function constFalse(): false;

// Always returns true
function constTrue(): true;

// Always returns null
function constNull(): null;

// Always returns undefined
function constUndefined(): undefined;

// Always returns void
function constVoid(): void;

// Increments a number
function increment(n: number): number;

// Decrements a number
function decrement(n: number): number;

// Throws on any input (used for exhaustive checks)
function absurd<A>(_: never): A;
```