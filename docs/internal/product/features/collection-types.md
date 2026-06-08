# Collection Types

Inspired by Python's `collections` and `collections.abc` modules, with a functional twist.

## Installation

```typescript
import { context, sequence, collection } from '@deessejs/fp';
```

## Real-World Examples

### context — Configuration & Scoping

```typescript
import { context } from '@deessejs/fp';

// Multi-layer config: defaults < env < CLI
function loadConfig() {
  return context<any>()
    .push({ // Defaults
      port: 3000,
      debug: false,
      logLevel: 'info',
      db: { host: 'localhost', port: 5432 },
    })
    .push({ // Environment overrides
      port: parseInt(process.env.PORT ?? ''),
      debug: process.env.DEBUG === 'true',
      db: {
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
      },
    })
    .push({ // CLI args (highest priority)
      port: cliArgs.port,
      debug: cliArgs.debug,
    });
}

const config = loadConfig();

// Access with fallbacks
const port = config.get('port', 3000);
const dbHost = config.get('db.host', 'localhost');

// Scoped config for request
function createRequestScope(parentConfig: Context, request: Request) {
  return parentConfig.scope({
    requestId: crypto.randomUUID(),
    userId: request.headers['x-user-id'],
    startTime: Date.now(),
  });
}

// Middleware
app.use((req, res, next) => {
  const scoped = createRequestScope(config, req);

  req.context = scoped;

  res.on('finish', () => {
    const duration = Date.now() - scoped.get('startTime', 0);
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });

  next();
});

// DI context for services
interface ServiceDeps {
  db: Database;
  cache: Cache;
  logger: Logger;
}

function createServiceContext(deps: ServiceDeps): Context<ServiceDeps[keyof ServiceDeps]> {
  return context().push(deps);
}

// Usage in route handler
app.get('/users/:id', async (req, res) => {
  const deps = req.context.get('db'); // Get DB from context
  const user = await deps.users.findById(req.params.id);
  res.json(user);
});
```

### sequence — Lazy Data Processing

```typescript
import { sequence } from '@deessejs/fp';

// Generate IDs (lazy - only computed when needed)
const userIds = sequence.range(1, Infinity)
  .map(id => `user_${id}`);

// Process in chunks
async function* paginateUsers(batchSize = 100) {
  for (let offset = 0; ; offset += batchSize) {
    const users = await db.users.find({ limit: batchSize, offset });
    if (users.length === 0) break;
    yield* users;
  }
}

// Find first user matching criteria
async function findFirstAdmin(): Promise<Maybe<User>> {
  return sequence.collect(paginateUsers())
    .then(users =>
      sequence.from(users).find(u => u.role === 'admin')
    );
}

// Transform stream
const processedUsers = sequence.from(paginateUsers())
  .filter(u => u.active)
  .map(u => ({ ...u, displayName: `${u.firstName} ${u.lastName}` }))
  .map(u => u.email.toLowerCase())
  .take(1000)
  .toArray();

// Group by category
const usersByRole = sequence.from(paginateUsers())
  .groupBy(u => u.role)
  .toArray();

// Pagination with cursor
function* paginateWithCursor<T>(
  fetchPage: (cursor: string | null) => Promise<{ items: T[]; nextCursor: string | null }>
) {
  let cursor: string | null = null;

  while (true) {
    const { items, nextCursor } = await fetchPage(cursor);
    yield* items;

    if (!nextCursor) break;
    cursor = nextCursor;
  }
}

// Fibonacci (lazy, infinite)
const fibonacci = sequence.unfold(
  [0, 1] as [number, number],
  ([a, b]) => [a, [b, a + b]] as [number, [number, number]]
);

// Take first 10: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
const first10 = fibonacci.take(10).toArray();

// Remove duplicates while preserving order
const uniqueEmails = sequence.from(allEmails).unique().toArray();
```

### collection — Array Operations with Set Semantics

```typescript
import { collection } from '@deessejs/fp';

// User permissions example
const userPermissions = collection(['read', 'write', 'delete']);
const adminPermissions = collection(['read', 'write', 'delete', 'admin']);

// Check permissions
const hasDeletePermission = userPermissions
  .intersection(collection(['delete']))
  .size > 0;

// All user permissions (union)
const allPermissions = userPermissions.union(adminPermissions);
// ['read', 'write', 'delete', 'admin']

// Permissions only admins have
const adminOnly = adminPermissions.difference(userPermissions);
// ['admin']

// Common permissions
const shared = userPermissions.intersection(adminPermissions);
// ['read', 'write', 'delete']

// Tag management
const userTags = collection(['urgent', 'client-a', 'high-priority']);
const availableTags = collection(['urgent', 'client-b', 'low-priority', 'high-priority']);

const tagsToAdd = availableTags.difference(userTags);
// ['client-b', 'low-priority']

const tagsToRemove = userTags.difference(availableTags);
// []

// Filter and transform
const activeUsers = collection(users)
  .filter(u => u.active)
  .map(u => u.email)
  .toArray();

// Partition
const [admins, regularUsers] = collection(users)
  .partition(u => u.role === 'admin');

// Group by department
const byDepartment = collection(users)
  .toMap(u => u.department);

// Merge multiple sources
const allProducts = collection([
  ...catalogProducts,
  ...featuredProducts,
  ...newArrivals,
]).unique().toArray();

// Set operations with custom comparison
const findDuplicateEmails = (users: User[]) => {
  const emails = collection(users).map(u => u.email.toLowerCase());
  const unique = emails.unique();
  const duplicates = emails.difference(unique);
  return duplicates.toArray();
};
```

### AsyncIterator Utilities — Stream Processing

```typescript
import { collect, first, last, mapAsync, filterAsync } from '@deessejs/fp';

// Real-time event stream
async function* subscribeToEvents(channel: string) {
  const ws = new WebSocket(`wss://api.example.com/${channel}`);

  while (true) {
    const message = await ws.receive();
    yield JSON.parse(message);
  }
}

// Process events with backpressure
async function processEventStream(channel: string) {
  const events = subscribeToEvents(channel);

  // Take first 100 events
  const initialEvents = await collect(events, { limit: 100 });

  // Filter for specific type
  const clicks = await filterAsync(
    subscribeToEvents(channel),
    e => e.type === 'click'
  );

  // Transform and batch
  const batched = await mapAsync(
    subscribeToEvents(channel),
    event => enrichEvent(event)
  );

  // Process in batches of 50
  for await (const batch of batchIterator(subscribeToEvents(channel), 50)) {
    await db.events.createMany(batch);
  }
}

// Server-Sent Events
async function* sseStream(url: string): AsyncGenerator<Data> {
  const response = await fetch(url);
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    yield JSON.parse(decoder.decode(value));
  }
}

// Collect with timeout
async function collectWithTimeout<T>(
  iterable: AsyncIterable<T>,
  timeoutMs: number
): Promise<T[]> {
  return Promise.race([
    collect(iterable),
    sleep(timeoutMs).then(() => []),
  ]);
}
```

## Comparison with Python Collections

| Python | @deessejs/fp | Use Case |
|--------|---------------|----------|
| `ChainMap` | `context` | Config precedence, scopes |
| `deque` | `queue` | Job queues, buffers |
| `defaultdict` | `getOrCompute` | Lazy defaults |
| `namedtuple` | `type`/`interface` | TypeScript native |
| `OrderedDict` | — | Not needed (insertion order in Map) |
| `Counter` | — | Specific use case |

## API Reference

### context

Context for stacking maps with lookup precedence.

```typescript
function context<T = unknown>(): Context<T>;
function context<T>(maps: Record<string, T>[]): Context<T>;

interface Context<T> {
  get(key: string): Maybe<T>;
  get(key: string, fallback: T): T;
  has(key: string): boolean;
  keys(): string[];
  values(): T[];
  entries(): [string, T][];
  push(map: Record<string, T>): Context<T>;
  scope(overrides: Record<string, T>): Context<T>;
  parent(): Maybe<Context<T>>;
}
```

### sequence

Lazy sequence with FP operations.

```typescript
function sequence<T>(iterable: Iterable<T>): Sequence<T>;

interface sequence {
  range(start: number, end: number): Sequence<number>;
  range(start: number, end: number, step: number): Sequence<number>;
  from<T>(iterable: Iterable<T>): Sequence<T>;
  repeat<T>(value: T): Sequence<T>;
  repeat<T>(value: T, times: number): Sequence<T>;
  unfold<A, B>(seed: A, fn: (a: A) => [B, A] | null): Sequence<B>;
}

interface Sequence<T> {
  map<B>(fn: (value: T) => B): Sequence<B>;
  flatMap<B>(fn: (value: T) => Iterable<B>): Sequence<B>;
  filter(predicate: (value: T) => boolean): Sequence<T>;
  chunk(size: number): Sequence<T[]>;
  unique(): Sequence<T>;
  groupBy<K>(keyFn: (value: T) => K): Sequence<[K, T[]]>;
  take(count: number): Sequence<T>;
  takeWhile(predicate: (value: T) => boolean): Sequence<T>;
  drop(count: number): Sequence<T>;
  dropWhile(predicate: (value: T) => boolean): Sequence<T>;
  find(predicate: (value: T) => boolean): Maybe<T>;
  [Symbol.iterator](): Iterator<T>;
  collect(): T[];
  first(): Maybe<T>;
  last(): Maybe<T>;
}
```

### collection

FP wrapper around Array with set-like operations.

```typescript
function collection<T>(items: T[]): Collection<T>;

interface Collection<T> {
  map<B>(fn: (value: T) => B): Collection<B>;
  filter(predicate: (value: T) => boolean): Collection<T>;
  flatMap<B>(fn: (value: T) => Iterable<B>): Collection<B>;
  reduce<A>(fn: (acc: A, value: T) => A, initial: A): A;
  union(other: Collection<T>): Collection<T>;
  intersection(other: Collection<T>): Collection<T>;
  difference(other: Collection<T>): Collection<T>;
  symmetricDifference(other: Collection<T>): Collection<T>;
  isSubsetOf(other: Collection<T>): boolean;
  isSupersetOf(other: Collection<T>): boolean;
  isDisjointFrom(other: Collection<T>): boolean;
  partition(predicate: (value: T) => boolean): [Collection<T>, Collection<T>];
  toArray(): T[];
  toSet(): Set<T>;
  toMap<K>(keyFn: (value: T) => K): Map<K, T[]>;
}
```

### Interfaces

```typescript
interface Functor<F> {
  map<A, B>(fa: F<A>, f: (a: A) => B): F<B>;
}

interface Applicative<A> extends Functor<A> {
  of<B>(value: B): Applicative<B>;
  ap<B>(fab: Applicative<(a: A) => B>): Applicative<B>;
}

interface Monad<M> extends Applicative<M> {
  flatMap<A, B>(ma: M<A>, f: (a: A) => M<B>): M<B>;
}

interface Foldable<T> {
  reduce<A>(fa: T, f: (acc: A, a: A) => A, initial: A): A;
}

interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

interface AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}
```