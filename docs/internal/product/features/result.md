# Result

Represents a value that may have failed. Models the `Ok | Err` pattern found in Rust, Haskell, and Zig.

## Why Result?

Instead of throwing exceptions, functions return `Result`. This makes error handling explicit and type-safe â€” no more forgotten try/catch blocks.

```typescript
// Without Result - exceptions can slip through
function parseConfig(input: string) {
  const parsed = JSON.parse(input); // throws on invalid JSON
  if (!parsed.version) throw new Error('Missing version');
  return parsed;
}

// With Result - errors are part of the type
function parseConfig(input: string): Result<Config, ParseError> {
  return try_(() => JSON.parse(input))
    .flatMap(cfg => cfg.version
      ? ok(cfg)
      : err(ParseError({ reason: 'Missing version' }))
    );
}
```

## Installation

```typescript
import { Result, ok, err } from '@deessejs/fp';
```

## Real-World Examples

### API Handler (Express/Next.js)

```typescript
import { Result, ok, err, pipe } from '@deessejs/fp';
import { error } from '@deessejs/errors';

// Define error types
const ValidationError = error({
  name: 'ValidationError',
  message: 'Field "{field}" is invalid: {reason}',
});

const NotFoundError = error({
  name: 'NotFoundError',
  message: 'User "{id}" not found',
});

const DatabaseError = error({
  name: 'DatabaseError',
  message: 'Database operation failed',
});

// Service layer with Result
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

async function getUserById(id: string): Promise<Result<User, NotFoundError | DatabaseError>> {
  return tryPromise(() => db.users.findById(id))
    .mapError(cause => DatabaseError({ cause }))
    .flatMap(user => user
      ? ok(user)
      : err(NotFoundError({ id }))
    );
}

// API Handler
async function handler(req: Request): Promise<Response> {
  const userId = req.params.id;

  const result = await getUserById(userId);

  return pipe(
    result,
    Result.match({
      ok: (user) => Response.json({ user }),
      err: (e) => {
        if (is(e, NotFoundError)) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }
        if (is(e, DatabaseError)) {
          console.error('DB error:', e.cause);
          return Response.json({ error: 'Internal error' }, { status: 500 });
        }
        return Response.json({ error: 'Unknown error' }, { status: 500 });
      },
    })
  );
}
```

### User Registration with Validation

```typescript
import { Result, ok, err, pipe, gen } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

// Validate email format
function validateEmail(email: string): Result<string, ValidationError> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
    ? ok(email)
    : err(ValidationError({ reason: 'Invalid email format' }));
}

// Validate password strength
function validatePassword(password: string): Result<string, ValidationError> {
  if (password.length < 8) {
    return err(ValidationError({ reason: 'Password must be at least 8 characters' }));
  }
  if (!/[A-Z]/.test(password)) {
    return err(ValidationError({ reason: 'Password must contain uppercase' }));
  }
  return ok(password);
}

// Hash password (simulated)
async function hashPassword(password: string): Promise<Result<string, Error>> {
  return ok(await bcrypt.hash(password, 10));
}

// Register user - composing all validations
async function registerUser(input: RegisterInput): Promise<Result<User, ValidationError>> {
  return pipe(
    validateEmail(input.email),
    flatMap(() => validatePassword(input.password)),
    flatMap(async (password) => {
      const hashed = await hashPassword(password);
      return hashed.mapError(e => ValidationError({ reason: 'Hash failed' }));
    }),
    flatMap(async (hashedPassword) => {
      const user = await db.users.create({
        email: input.email,
        password: hashedPassword,
        name: input.name,
      });
      return ok(user);
    })
  );
}

// Usage in controller
app.post('/register', async (req, res) => {
  const result = await registerUser(req.body);

  result.match({
    ok: (user) => res.status(201).json({ userId: user.id }),
    err: (e) => res.status(400).json({
      error: e.message,
      fields: e.fields,
    }),
  });
});
```

### File Processing Pipeline

```typescript
import { Result, ok, err, pipe, sequence } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const FileError = error({
  name: 'FileError',
  message: 'File operation failed: {reason}',
});

interface ProcessedFile {
  name: string;
  content: string;
  size: number;
}

// Read file safely
async function readFile(path: string): Promise<Result<string, FileError>> {
  return tryPromise(() => fs.readFile(path, 'utf-8'))
    .mapError(cause => FileError({ reason: `Cannot read ${path}` }));
}

// Process file content
function processContent(content: string): Result<string, FileError> {
  const trimmed = content.trim();
  return trimmed.length > 0
    ? ok(trimmed)
    : err(FileError({ reason: 'File is empty' }));
}

// Compress content (simulated)
async function compress(content: string): Promise<Result<string, FileError>> {
  return ok(gzip.compress(content));
}

// Process multiple files
async function processFiles(paths: string[]): Promise<Result<ProcessedFile[], FileError>> {
  return pipe(
    sequence.from(paths),
    sequence.map(async (path) => {
      const fileResult = await readFile(path);

      return fileResult.flatMap(content => {
        return processContent(content).flatMap(async (processed) => {
          const compressed = await compress(processed);
          return compressed.map(comp => ({
            name: path.basename(path),
            content: comp,
            size: comp.length,
          }));
        });
      });
    }),
    sequence.collect(),
    Result.map(items => items.filter((r): r is ProcessedFile =>
      r !== undefined
    ) as ProcessedFile[]),
  );
}
```

### Database Transaction with Rollback

```typescript
import { Result, ok, err, gen } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const TransactionError = error({
  name: 'TransactionError',
  message: 'Transaction failed: {reason}',
});

interface Order {
  id: string;
  userId: string;
  total: number;
}

interface User {
  id: string;
  balance: number;
}

// Create order with balance deduction
async function createOrderWithPayment(
  userId: string,
  items: CartItem[]
): Promise<Result<Order, TransactionError>> {
  return gen(async function* () {
    // 1. Get user with lock
    const user = yield* await getUserWithLock(userId)
      .mapError(e => TransactionError({ reason: e.message }));

    // 2. Calculate total
    const total = items.reduce((sum, item) => sum + item.price, 0);

    // 3. Check balance
    if (user.balance < total) {
      return err(TransactionError({
        reason: `Insufficient balance. Need ${total}, have ${user.balance}`,
      }));
    }

    // 4. Deduct balance
    yield* await deductBalance(userId, total)
      .mapError(e => TransactionError({ reason: 'Failed to deduct balance' }));

    // 5. Create order
    const order = yield* await createOrder({ userId, items, total })
      .mapError(e => TransactionError({ reason: 'Failed to create order' }));

    return ok(order);
  });
}
```

## Dual API

All methods work both as instance methods and as pipeable static functions:

```typescript
import { Result, ok, err, pipe } from '@deessejs/fp';

// Instance method style
const a = ok(5).map(n => n * 2); // Ok(10)

// Static data-first style
const b = Result.map(ok(5), n => n * 2); // Ok(10)

// Static data-last (pipeable) style
const c = pipe(ok(5), Result.map(n => n * 2)); // Ok(10)
```

## Methods

### map

Transforms the success value if Ok, passes through if Err.

```typescript
ok(5).map(n => n * 2); // Ok(10)
err('error').map(n => n * 2); // Err('error')
```

### flatMap (andThen)

Chains a Result-returning function on success.

```typescript
ok(5).flatMap(n => n > 0 ? ok(n) : err('negative')); // Ok(5)
```

### filter

Filters the value, returning Err if predicate fails.

```typescript
ok(5).filter(n => n % 2 === 0); // Err(FilterError)
ok(4).filter(n => n % 2 === 0); // Ok(4)
```

### tap

Runs a side effect on success, returns the original Result.

```typescript
ok(5).tap(console.log); // logs 5, returns Ok(5)
```

### mapError

Transforms the error value if Err.

```typescript
err('error').mapError(e => new Error(e)); // Err(Error('error'))
```

### fold

Transforms both variants to the same type.

```typescript
ok(5).fold(
  n => `Success: ${n}`,
  e => `Error: ${e}`,
); // "Success: 5"
```

### getOrElse

Returns the value or a fallback.

```typescript
ok(5).getOrElse(0); // 5
err('error').getOrElse(0); // 0
```

## Type Guards

```typescript
const result = divide(10, 2);

if (result.isOk()) {
  console.log(result.value); // number
} else {
  console.log(result.error); // string
}
```

## API Reference

### Types

```typescript
// Result is a union of Ok and Err
type Result<T, E> = Ok<T, E> | Err<T, E>;

// Ok variant
interface Ok<T, E = never> {
  readonly _tag: 'Ok';
  readonly value: T;
}

// Err variant
interface Err<T = never, E> {
  readonly _tag: 'Err';
  readonly error: E;
}
```

### Constructors

```typescript
// Create a successful result
function ok<T>(value: T): Ok<T, never>;

// Create an error result
function err<E>(error: E): Err<never, E>;
```

### Instance Methods

```typescript
interface Result<T, E> {
  // Transformation
  map<B>(fn: (value: T) => B): Result<B, E>;
  flatMap<B, E2>(fn: (value: T) => Result<B, E2>): Result<B, E | E2>;
  filter<B extends T>(predicate: (value: T) => boolean): Result<B, FilterError>;
  mapError<E2>(fn: (error: E) => E2): Result<T, E2>;

  // Pattern matching
  fold<U>(onOk: (value: T) => U, onErr: (error: E) => U): U;

  // Unwrapping
  getOrElse(value: T): T;
  unwrap(): T;
  unwrapOr(other: T): T;

  // Side effects
  tap(fn: (value: T) => void): Result<T, E>;
  tapAsync(fn: (value: T) => Promise<void>): Promise<Result<T, E>>;

  // Type guards
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;

  // Iterable (for gen)
  [Symbol.iterator](): Generator<Err<never, E>, T, unknown>;
}
```

### Static Methods (Dual API)

```typescript
// All static methods support both data-first and data-last forms
Result.map(result, fn); // data-first
pipe(result, Result.map(fn)); // data-last (pipeable)

// Transformation
Result.map<T, B, E>(result: Result<T, E>, fn: (value: T) => B): Result<B, E>;
Result.map<B>(fn: (value: T) => B): <E>(result: Result<T, E>) => Result<B, E>;

Result.flatMap<T, B, E, E2>(result: Result<T, E>, fn: (value: T) => Result<B, E2>): Result<B, E | E2>;
Result.flatMap<B, E2>(fn: (value: T) => Result<B, E2>): <E>(result: Result<T, E>) => Result<B, E | E2>;

Result.filter<T, E>(result: Result<T, E>, predicate: (value: T) => boolean): Result<T, E | FilterError>;
Result.filter(predicate: (value: T) => boolean): <E>(result: Result<T, E>) => Result<T, E | FilterError>;

Result.mapError<T, E, E2>(result: Result<T, E>, fn: (error: E) => E2): Result<T, E2>;
Result.mapError<E, E2>(fn: (error: E) => E2): <T>(result: Result<T, E>) => Result<T, E2>;

// Pattern matching
Result.match<T, E, U>(result: Result<T, E>, handlers: {
  ok: (value: T) => U;
  err: (error: E) => U;
}): U;
Result.match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): (result: Result<T, E>) => U;

// Unwrapping
Result.unwrap<T, E>(result: Result<T, E>): T;
Result.unwrapOr<T, E, B>(result: Result<T, E>, fallback: B): T | B;
Result.unwrapOr<B>(fallback: B): <T, E>(result: Result<T, E>) => T | B;

// Side effects
Result.tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E>;
Result.tap(fn: (value: T) => void): <E>(result: Result<T, E>) => Result<T, E>;

Result.tapAsync<T, E>(result: Result<T, E>, fn: (value: T) => Promise<void>): Promise<Result<T, E>>;
Result.tapAsync(fn: (value: T) => Promise<void>): <E>(result: Result<T, E>) => Promise<Result<T, E>>;

// Type guards
Result.isOk(result: Result<unknown, unknown>): result is Ok<unknown, never>;
Result.isErr(result: Result<unknown, unknown>): result is Err<never, unknown>;
```

### Generator Composition

```typescript
// Create result from generator
function gen<R extends AnyResult>(
  body: () => Generator<Result<unknown, unknown>, R, unknown>
): Result<InferOk<R>, InferErr<R>>;

// Async variant
function gen<R extends AnyResult>(
  body: () => AsyncGenerator<Result<unknown, unknown>, R, unknown>
): Promise<Result<InferOk<R>, InferErr<R>>>;
```

### Utility Functions

```typescript
// Serialize for RPC/storage
function serialize<T, E>(result: Result<T, E>): SerializedResult<T, E>;

// Deserialize from RPC/storage
function deserialize<T, E>(value: unknown): Result<T, E | DeserializationError>;

// Partition array of Results
function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]];
```\n## Wrapping Throwing Functions\n\nResult is also the home for wrapping throwing code. The fromThrowable and fromAsyncThrowable factories catch exceptions and surface them as Err, so every throwing boundary in your codebase becomes a typed Result<T, E>.\n\n### fromThrowable\n\n```typescript\nfunction fromThrowable<T>(thunk: () => T): Result<T, UnhandledException>;\nfunction fromThrowable<T, E>(options: {\n  onSuccess: () => T;\n  onError: (cause: unknown) => E;\n}): Result<T, E>;\n```\n\nTwo overloads:\n\n- fromThrowable(thunk) â€” captures any thrown value into an UnhandledException carrying the original cause.\n- fromThrowable({ onSuccess, onError }) â€” runs onSuccess inside a try/catch; thrown values are mapped through onError.\n\n```typescript\nimport { fromThrowable, ok, err, getOrElse } from "@deessejs/fp";\n\nconst config = getOrElse(defaultConfig)(\n  fromThrowable<Config, Error>({\n    onSuccess: () => readConfigSync(path),\n    onError: (e) => e instanceof Error ? e : new Error(String(e)),\n  }),\n);\n```\n\n### fromAsyncThrowable\n\n```typescript\nfunction fromAsyncThrowable<T>(thunk: () => Promise<T>): Promise<Result<T, UnhandledException>>;\nfunction fromAsyncThrowable<T, E>(options: {\n  onSuccess: () => Promise<T>;\n  onError: (cause: unknown) => E | Promise<E>;\n}): Promise<Result<T, E>>;\n```\n\nSame shape, async. Rejects and sync throws are captured; the onError mapper may itself return a Promise.\n\n```typescript\nimport { pipe, map, getOrElse, fromAsyncThrowable } from "@deessejs/fp";\n\nconst templates = await pipe(\n  fromAsyncThrowable(() => orpc.templates.list(undefined, liveCache)),\n  map((list) => list.templates),\n  getOrElse([]),\n);\n```\n\n### UnhandledException\n\n```typescript\ninterface UnhandledException {\n  readonly _tag: "UnhandledException";\n  readonly cause: unknown;\n}\n```\n\nWrapper placed in the Err.error field when the thunk-only overload of fromThrowable / fromAsyncThrowable is used and no onError mapper is supplied. The original thrown value is preserved in cause.\n\n### attempt\n\n```typescript\nfunction attempt<T>(config: AttemptConfig<T>): Attempt<T>;\n\ninterface AttemptConfig<T> {\n  readonly onSuccess: () => T | Promise<T>;\n  readonly retry?: RetryConfig<unknown>;\n  readonly normalize?: (e: unknown) => unknown;\n}\n\ninterface Attempt<T> {\n  execute(): Promise<Result<T, unknown>>;\n  clientSafe(): Promise<Result<T, NormalizedError>>;\n}\n```\n\nA lazy wrapper around a throwing operation. attempt() does not invoke onSuccess; the wrapped operation runs only when execute() or clientSafe() is called. A single re-attempt is performed when config.retry.shouldRetry(cause) returns true. clientSafe() returns Result<T, NormalizedError> with a safe-shape error suitable for HTTP responses.\n\n### withReporting\n\n```typescript\nfunction withReporting<T>(\n  onSuccess: () => T | Promise<T>,\n  operationName: string,\n  reporter: ErrorReporter,\n  metadata?: Readonly<Record<string, unknown>>,\n): Promise<Result<T, ReportableError>>;\n\ninterface ErrorReporter {\n  report(error: unknown, context: ErrorContext): void;\n}\ninterface ErrorContext {\n  readonly timestamp: number;\n  readonly operation: string;\n  readonly metadata?: Readonly<Record<string, unknown>>;\n}\ninterface ReportableError {\n  readonly _tag: "ReportableError";\n  readonly message: string;\n  readonly cause?: unknown;\n}\n```\n\nWraps a sync or async operation. On failure, the original cause is forwarded to the ErrorReporter, and a Result<T, ReportableError> is returned. The ReportableError preserves the original cause in its cause field.\n\n### classifyError\n\n```typescript\nfunction classifyError(\n  e: unknown,\n  rules: ClassificationRule[],\n): ErrorClassification;\n\ntype ErrorClassification = "retryable" | "non-retryable";\n\ninterface ClassificationRule {\n  readonly error: ErrorConstructor;\n  readonly classification: ErrorClassification;\n}\n\ntype ErrorConstructor = abstract new (...args: unknown[]) => Error;\n```\n\nMatches a thrown value against a list of Error constructors with instanceof and returns the classification of the first matching rule, or non-retryable when the value is not an Error or no rule matches.\n'
echo "result.md: $(wc -l < /c/Users/dpereira/.t3/worktrees/fp/t3code-ca972007/docs/internal/product/features/result.md) lines"
APPEND_EOF_DUMMY
echo "result.md: $(wc -l < /c/Users/dpereira/.t3/worktrees/fp/t3code-ca972007/docs/internal/product/features/result.md) lines"


## Wrapping Throwing Functions

Result is also the home for wrapping throwing code. The fromThrowable and fromAsyncThrowable factories catch exceptions and surface them as Err, so every throwing boundary in your codebase becomes a typed Result<T, E>.

### fromThrowable

```typescript
function fromThrowable<T>(thunk: () => T): Result<T, UnhandledException>;
function fromThrowable<T, E>(options: {
  onSuccess: () => T;
  onError: (cause: unknown) => E;
}): Result<T, E>;
```

Two overloads:

- fromThrowable(thunk) — captures any thrown value into an UnhandledException carrying the original cause.
- fromThrowable({ onSuccess, onError }) — runs onSuccess inside a try/catch; thrown values are mapped through onError.

```typescript
import { fromThrowable, ok, err, getOrElse } from "@deessejs/fp";

const config = getOrElse(defaultConfig)(
  fromThrowable<Config, Error>({
    onSuccess: () => readConfigSync(path),
    onError: (e) => e instanceof Error ? e : new Error(String(e)),
  }),
);
```

### fromAsyncThrowable

```typescript
function fromAsyncThrowable<T>(thunk: () => Promise<T>): Promise<Result<T, UnhandledException>>;
function fromAsyncThrowable<T, E>(options: {
  onSuccess: () => Promise<T>;
  onError: (cause: unknown) => E | Promise<E>;
}): Promise<Result<T, E>>;
```

Same shape, async. Rejects and sync throws are captured; the onError mapper may itself return a Promise.

```typescript
import { pipe, map, getOrElse, fromAsyncThrowable } from "@deessejs/fp";

const templates = await pipe(
  fromAsyncThrowable(() => orpc.templates.list(undefined, liveCache)),
  map((list) => list.templates),
  getOrElse([]),
);
```

### UnhandledException

```typescript
interface UnhandledException {
  readonly _tag: "UnhandledException";
  readonly cause: unknown;
}
```

Wrapper placed in the Err.error field when the thunk-only overload of fromThrowable / fromAsyncThrowable is used and no onError mapper is supplied. The original thrown value is preserved in cause.

### attempt

```typescript
function attempt<T>(config: AttemptConfig<T>): Attempt<T>;

interface AttemptConfig<T> {
  readonly onSuccess: () => T | Promise<T>;
  readonly retry?: RetryConfig<unknown>;
  readonly normalize?: (e: unknown) => unknown;
}

interface Attempt<T> {
  execute(): Promise<Result<T, unknown>>;
  clientSafe(): Promise<Result<T, NormalizedError>>;
}
```

A lazy wrapper around a throwing operation. attempt() does not invoke onSuccess; the wrapped operation runs only when execute() or clientSafe() is called. A single re-attempt is performed when config.retry.shouldRetry(cause) returns true. clientSafe() returns Result<T, NormalizedError> with a safe-shape error suitable for HTTP responses.

### withReporting

```typescript
function withReporting<T>(
  onSuccess: () => T | Promise<T>,
  operationName: string,
  reporter: ErrorReporter,
  metadata?: Readonly<Record<string, unknown>>,
): Promise<Result<T, ReportableError>>;

interface ErrorReporter {
  report(error: unknown, context: ErrorContext): void;
}
interface ErrorContext {
  readonly timestamp: number;
  readonly operation: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
interface ReportableError {
  readonly _tag: "ReportableError";
  readonly message: string;
  readonly cause?: unknown;
}
```

Wraps a sync or async operation. On failure, the original cause is forwarded to the ErrorReporter, and a Result<T, ReportableError> is returned. The ReportableError preserves the original cause in its cause field.

### classifyError

```typescript
function classifyError(
  e: unknown,
  rules: ClassificationRule[],
): ErrorClassification;

type ErrorClassification = "retryable" | "non-retryable";

interface ClassificationRule {
  readonly error: ErrorConstructor;
  readonly classification: ErrorClassification;
}

type ErrorConstructor = abstract new (...args: unknown[]) => Error;
```

Matches a thrown value against a list of Error constructors with instanceof and returns the classification of the first matching rule, or non-retryable when the value is not an Error or no rule matches.
