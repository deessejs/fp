# Maybe

Represents an optional value. Models `Some | None` — no null checks needed.

## Why Maybe?

No more `undefined is not a function` or `Cannot read property 'x' of null`. Maybe makes optional values explicit and safe.

```typescript
// Without Maybe - runtime errors await
const user = users.get(id);
const name = user.profile.displayName; // crashes if user is undefined

// With Maybe - explicit handling
const user = findUser(id);
const name = user
  .map(u => u.profile)
  .flatMap(p => p.displayName)
  .getOrElse('Anonymous');
```

## Installation

```typescript
import { Maybe, some, none } from '@deessejs/fp';
```

## Real-World Examples

### Safe Property Access (Nested Objects)

```typescript
import { Maybe, some, none, pipe } from '@deessejs/fp';

interface Address {
  street?: string;
  city?: string;
  country?: {
    code: string;
    name: string;
  };
}

interface User {
  name: string;
  address?: Address;
}

// Without Maybe - painful
function getCountryName(user: User): string {
  if (user.address?.country) {
    return user.address.country.name;
  }
  return 'Unknown';
}

// With Maybe - clean and safe
function getCountryName(user: User): string {
  return pipe(
    some(user),
    Maybe.flatMap(u => Maybe.fromNullable(u.address)),
    Maybe.flatMap(a => Maybe.fromNullable(a.country)),
    Maybe.map(c => c.name),
    Maybe.getOrElse('Unknown'),
  );
}

// Or using fromNullable for any path
function getCountryCode(user: User): Maybe<string> {
  return Maybe.fromNullable(user.address?.country?.code);
}
```

### Configuration with Defaults

```typescript
import { Maybe, some, none, pipe } from '@deessejs/fp';

interface AppConfig {
  debug?: boolean;
  port?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  databaseUrl?: string;
}

// Load config from environment with fallbacks
function loadConfig(): AppConfig {
  const debug = process.env.DEBUG === 'true';
  const port = parseInt(process.env.PORT ?? '3000', 10);
  const logLevel = (process.env.LOG_LEVEL ?? 'info') as AppConfig['logLevel'];

  return { debug, port, logLevel };
}

// Validate config - return Maybe for optional fields
function validateDatabaseUrl(config: AppConfig): Maybe<string> {
  return config.databaseUrl
    ? some(config.databaseUrl)
    : none;
}

// Use in startup
const config = loadConfig();

pipe(
  validateDatabaseUrl(config),
  Maybe.tap(url => console.log(`Connecting to ${url}`)),
  Maybe.flatMap(url => tryConnect(url)),
  Maybe.match({
    some: () => console.log('Connected!'),
    none: () => console.log('No database configured, running in demo mode'),
  }),
);
```

### User Preferences with Optional Fields

```typescript
import { Maybe, some, none, pipe } from '@deessejs/fp';

interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  notifications?: {
    email?: boolean;
    push?: boolean;
    frequency?: 'instant' | 'daily' | 'weekly';
  };
}

interface User {
  id: string;
  name: string;
  preferences?: UserPreferences;
}

// Get effective theme (user preference or system default)
function getEffectiveTheme(prefs: Maybe<UserPreferences>): string {
  return pipe(
    prefs,
    Maybe.flatMap(p => Maybe.fromNullable(p.theme)),
    Maybe.getOrElse('system'),
  );
}

// Check if notifications are enabled
function hasPushNotifications(prefs: Maybe<UserPreferences>): boolean {
  return pipe(
    prefs,
    Maybe.flatMap(p => Maybe.fromNullable(p.notifications)),
    Maybe.flatMap(n => Maybe.fromNullable(n.push)),
    Maybe.getOrElse(false),
  );
}

// Get notification frequency with default
function getNotificationFrequency(prefs: Maybe<UserPreferences>): string {
  return pipe(
    prefs,
    Maybe.flatMap(p => Maybe.fromNullable(p.notifications)),
    Maybe.flatMap(n => Maybe.fromNullable(n.frequency)),
    Maybe.getOrElse('daily'),
  );
}

// Usage
const userPrefs = Maybe.fromNullable(currentUser?.preferences);

const theme = getEffectiveTheme(userPrefs);
const pushEnabled = hasPushNotifications(userPrefs);
const frequency = getNotificationFrequency(userPrefs);

console.log(`Theme: ${theme}, Push: ${pushEnabled}, Frequency: ${frequency}`);
```

### Finding Items in Collections

```typescript
import { Maybe, some, none, pipe, collection } from '@deessejs/fp';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface CartItem {
  productId: string;
  quantity: number;
}

// Find product by ID
const products: Product[] = [...];

function findProduct(id: string): Maybe<Product> {
  return some(products).flatMap(list =>
    list.find(p => p.id === id) ?? none
  );
}

// Find most expensive product in category
function findMostExpensive(category: string): Maybe<Product> {
  return pipe(
    some(products),
    Maybe.flatMap(list => some(list.filter(p => p.category === category))),
    Maybe.map(items => items.reduce(
      (max, p) => p.price > max.price ? p : max,
      { id: '', name: '', category, price: 0 }
    )),
  );
}

// Get cart total with product lookup
function calculateCartTotal(items: CartItem[]): Maybe<number> {
  return pipe(
    collection(items),
    collection.map(item => findProduct(item.productId)),
    collection.filter(product => product.isSome()),
    collection.reduce((total, maybeProduct) =>
      maybeProduct.fold(
        product => total + product.price * items.find(i => i.productId === product.id)!.quantity,
        () => total
      ),
      0
    ),
  );
}
```

### API Query Parameters

```typescript
import { Maybe, some, none, pipe } from '@deessejs/fp';

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  filter?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  filter?: string;
}

// Parse query params safely
function parseQueryParams(params: QueryParams): Maybe<PaginationOptions> {
  return pipe(
    some(params),
    Maybe.flatMap(p => Maybe.fromNullable(p.page)),
    Maybe.flatMap(pageStr => {
      const page = parseInt(pageStr, 10);
      return isNaN(page) ? none : some(page);
    }),
    Maybe.flatMap(page => {
      const limitStr = params.limit;
      if (!limitStr) return some({ page, limit: 20 });

      const limit = parseInt(limitStr, 10);
      return isNaN(limit) ? none : some({ page, limit: Math.min(limit, 100) });
    }),
    Maybe.map(({ page, limit }) => ({
      page,
      limit,
      sort: params.sort,
      filter: params.filter,
    })),
  );
}

// Usage in route handler
app.get('/users', (req, res) => {
  const options = parseQueryParams(req.query);

  options.match({
    some: opts => {
      const offset = (opts.page - 1) * opts.limit;
      const users = db.users.find({ limit: opts.limit, offset, sort: opts.sort });
      res.json({ users, page: opts.page });
    },
    none: () => {
      res.status(400).json({ error: 'Invalid pagination parameters' });
    },
  });
});
```

## Dual API

Same pattern as Result:

```typescript
import { Maybe, some, none, pipe } from '@deessejs/fp';

// Instance method style
const a = some(5).map(n => n * 2); // Some(10)

// Static data-last (pipeable) style
const b = pipe(some(5), Maybe.map(n => n * 2)); // Some(10)
```

## Methods

### map

Transforms the value if Some, passes through if None.

```typescript
some(5).map(n => n * 2); // Some(10)
none.map(n => n * 2); // None
```

### flatMap (andThen)

Chains a Maybe-returning function on success.

```typescript
some(5).flatMap(n => n > 0 ? some(n) : none); // Some(5)
```

### filter

Filters the value, returning None if predicate fails.

```typescript
some(5).filter(n => n % 2 === 0); // None
some(4).filter(n => n % 2 === 0); // Some(4)
```

### tap

Runs a side effect on Some, returns the original Maybe.

```typescript
some(5).tap(console.log); // logs 5, returns Some(5)
```

### fold

Transforms both variants to the same type.

```typescript
some(5).fold(
  n => `Got: ${n}`,
  () => 'Nothing',
); // "Got: 5"
```

### getOrElse

Returns the value or a fallback.

```typescript
some(5).getOrElse(0); // 5
none.getOrElse(0); // 0
```

### getOrNull / getOrUndefined

```typescript
some(5).getOrNull(); // 5
none.getOrNull(); // null

some(5).getOrUndefined(); // 5
none.getOrUndefined(); // undefined
```

## Type Guards

```typescript
const user = findUser('123');

if (user.isSome()) {
  console.log(user.value); // User
} else {
  console.log('User not found');
}
```

## API Reference

### Types

```typescript
// Maybe is a union of Some and None
type Maybe<T> = Some<T> | None;

// Some variant
interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

// None variant
interface None {
  readonly _tag: 'None';
}
```

### Constructors

```typescript
// Create a Some value
function some<T>(value: T): Some<T>;

// The None singleton
const none: None;

// Create Maybe from nullable value
function fromNullable<T>(value: T | null | undefined): Maybe<T>;
```

### Instance Methods

```typescript
interface Maybe<T> {
  // Transformation
  map<B>(fn: (value: T) => B): Maybe<B>;
  flatMap<B>(fn: (value: T) => Maybe<B>): Maybe<B>;
  filter(predicate: (value: T) => boolean): Maybe<T>;

  // Pattern matching
  fold<U>(onSome: (value: T) => U, onNone: () => U): U;

  // Unwrapping
  getOrElse(value: T): T;
  getOrNull(): T | null;
  getOrUndefined(): T | undefined;
  unwrap(): T;
  unwrapOr(other: T): T;

  // Side effects
  tap(fn: (value: T) => void): Maybe<T>;
  tapAsync(fn: (value: T) => Promise<void>): Promise<Maybe<T>>;

  // Type guards
  isSome(): this is Some<T>;
  isNone(): this is None;

  // Iterable (for gen)
  [Symbol.iterator](): Generator<None, T, unknown>;
}
```

### Static Methods (Dual API)

```typescript
// All static methods support both data-first and data-last forms
Maybe.map(maybe, fn); // data-first
pipe(maybe, Maybe.map(fn)); // data-last (pipeable)

// Transformation
Maybe.map<T, B>(maybe: Maybe<T>, fn: (value: T) => B): Maybe<B>;
Maybe.map<B>(fn: (value: T) => B): <T>(maybe: Maybe<T>) => Maybe<B>;

Maybe.flatMap<T, B>(maybe: Maybe<T>, fn: (value: T) => Maybe<B>): Maybe<B>;
Maybe.flatMap<B>(fn: (value: T) => Maybe<B>): <T>(maybe: Maybe<T>) => Maybe<B>;

Maybe.filter<T>(maybe: Maybe<T>, predicate: (value: T) => boolean): Maybe<T>;
Maybe.filter(predicate: (value: T) => boolean): <T>(maybe: Maybe<T>) => Maybe<T>;

// Pattern matching
Maybe.match<T, U>(maybe: Maybe<T>, handlers: {
  some: (value: T) => U;
  none: () => U;
}): U;
Maybe.match<U>(handlers: { some: (value: T) => U; none: () => U }): (maybe: Maybe<T>) => U;

// Unwrapping
Maybe.unwrap<T>(maybe: Maybe<T>): T;
Maybe.unwrapOr<T, B>(maybe: Maybe<T>, fallback: B): T | B;
Maybe.unwrapOr<B>(fallback: B): <T>(maybe: Maybe<T>) => T | B;
Maybe.getOrNull<T>(maybe: Maybe<T>): T | null;
Maybe.getOrUndefined<T>(maybe: Maybe<T>): T | undefined;

// Side effects
Maybe.tap<T>(maybe: Maybe<T>, fn: (value: T) => void): Maybe<T>;
Maybe.tap(fn: (value: T) => void): <T>(maybe: Maybe<T>) => Maybe<T>;

Maybe.tapAsync<T>(maybe: Maybe<T>, fn: (value: T) => Promise<void>): Promise<Maybe<T>>;
Maybe.tapAsync(fn: (value: T) => Promise<void>): <T>(maybe: Maybe<T>) => Promise<Maybe<T>>;

// Type guards
Maybe.isSome(maybe: Maybe<unknown>): maybe is Some<unknown>;
Maybe.isNone(maybe: Maybe<unknown>): maybe is None;

// Creation
Maybe.fromNullable<T>(value: T | null | undefined): Maybe<T>;
```