# Try

Wraps synchronous or asynchronous operations that may throw, converting
exceptions into a `Try<T, E>` value. The error is part of the type
signature, so callers can see every failure mode without reading the
implementation.

## Why Try?

Never let exceptions escape silently. Every throwing function should be
wrapped with `try_` or `tryPromise` before it crosses a trust
boundary.

```typescript
// Without Try — exceptions may slip through
function parseConfig(json: string): AppConfig {
  return JSON.parse(json); // throws on invalid JSON
}

// With Try — errors are explicit in the type
function parseConfig(json: string): Try<AppConfig, ParseError> {
  return try_({
    onSuccess: () => JSON.parse(json) as AppConfig,
    onError: (cause) => ParseError({ cause }),
  });
}
```

## Installation

```typescript
import {
  try_,
  tryPromise,
  attempt,
  withReporting,
  classifyError,
  success,
  failure,
  mapTry,
  flatMapTry,
  matchTry,
  toResultTry,
} from '@deessejs/fp';
```

## Real-World Examples

### JSON Configuration File

```typescript
import { try_, tryPromise, matchTry } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ConfigError = error({
  name: 'ConfigError',
  message: 'Configuration error: {reason}',
});

const ParseError = error({
  name: 'ParseError',
  message: 'Failed to parse: {cause}',
});

// Read and parse config file
async function loadConfig(path: string): Promise<Result<AppConfig, ConfigError>> {
  const content = await tryPromise(() => fs.readFile(path, 'utf-8'));
  const parsed = pipe(
    content,
    flatMapTry((raw) =>
      try_({
        onSuccess: () => JSON.parse(raw) as unknown,
        onError: (cause) => ParseError({ cause }),
      }),
    ),
  );
  return pipe(
    parsed,
    toResultTry(),
    map((data) => validateConfigSchema(data)),
    mapError((e) => ConfigError({ reason: `Invalid config: ${e.message}` })),
  );
}

// Validate schema
function validateConfigSchema(data: unknown): Result<AppConfig, ConfigError> {
  if (!data || typeof data !== 'object') {
    return err(ConfigError({ reason: 'Config must be an object' }));
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.port !== 'number') {
    return err(ConfigError({ reason: 'port must be a number' }));
  }
  return ok(obj as AppConfig);
}

// Usage
app.start(async () => {
  const config = await loadConfig('./config.json');
  config.match({
    ok: (cfg) => {
      app.listen(cfg.port);
      console.log(`Server started on port ${cfg.port}`);
    },
    err: (e) => {
      console.error('Failed to load config:', e.message);
      process.exit(1);
    },
  });
});
```

### API Request with Typed Error Handling

```typescript
import { tryPromise, withReporting } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ApiError = error({
  name: 'ApiError',
  message: 'API request failed: {cause}',
});

const NetworkError = error({
  name: 'NetworkError',
  message: 'Network error: {reason}',
});

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<Result<T, ApiError | NetworkError>> {
  const fetched = await tryPromise(() => fetch(url, options));
  return pipe(
    fetched,
    flatMapTry(async (response) => {
      if (!response.ok) {
        const body = await response.text().catch(() => 'Unknown error');
        return err<T, ApiError | NetworkError>(
          ApiError({ cause: `HTTP ${response.status}: ${body}` }),
        );
      }
      const json = await tryPromise(() => response.json() as Promise<T>);
      return pipe(
        json,
        mapTry((value) => value),
        toResultTry(),
        mapError((e) => ApiError({ cause: e })),
      );
    }),
  );
}

async function getUser(userId: string): Promise<Result<User, ApiError | NetworkError>> {
  return apiRequest<User>(`/api/users/${userId}`);
}

app.get('/users/:id', async (req, res) => {
  const result = await withReporting(
    () => getUser(req.params.id),
    'getUser',
    { report: (e, ctx) => metrics.increment('error', { op: ctx.operation }) },
    { userId: req.params.id },
  );
  result.match({
    ok: (user) => res.json(user),
    err: (e) => res.status(500).json({ error: 'Internal error' }),
  });
});
```

### Database Operations

```typescript
import { tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const DatabaseError = error({
  name: 'DatabaseError',
  message: 'Database operation failed: {cause}',
});

const QueryError = error({
  name: 'QueryError',
  message: 'Query error: {reason}',
});

async function safeQuery<T>(
  query: string,
  params?: unknown[],
): Promise<Result<T, DatabaseError>> {
  const result = await tryPromise({
    onSuccess: () => db.query(query, params),
    onError: (e) => DatabaseError({ cause: e }),
  });
  return toResultTry()(result);
}

// Safe transaction with explicit cleanup on failure
async function safeTransaction<T>(
  fn: (client: DbClient) => Promise<T>,
): Promise<Result<T, DatabaseError>> {
  const attempted = await tryPromise({
    onSuccess: async () => {
      const client = await db.connect();
      try {
        const result = await fn(client);
        await client.commit();
        return result;
      } catch (e) {
        await client.rollback();
        throw e;
      } finally {
        client.release();
      }
    },
    onError: (e) => DatabaseError({ cause: e }),
  });
  return toResultTry()(attempted);
}

// Safe insert with validation
async function insertUser(
  data: unknown,
): Promise<Result<User, DatabaseError | QueryError>> {
  const validated = try_({
    onSuccess: () => validateUserData(data),
    onError: (e) => QueryError({ reason: e.message }),
  });
  return pipe(
    validated,
    flatMapTry((valid) => safeQuery<User>(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [valid.email, valid.name],
    ).then((r) => (r.isOk() ? ok<User, DatabaseError | QueryError>(r.value[0]) : r))),
  );
}
```

### File System Operations

```typescript
import { tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const FileError = error({
  name: 'FileError',
  message: 'File operation failed: {cause}',
});

function readFile(path: string): Promise<Result<string, FileError>> {
  const t = tryPromise({
    onSuccess: () => fs.readFile(path, 'utf-8'),
    onError: (e) => FileError({ reason: `Cannot read ${path}: ${e}` }),
  });
  return t.then(toResultTry());
}

function writeFile(
  path: string,
  content: string,
): Promise<Result<void, FileError>> {
  const t = tryPromise({
    onSuccess: () => fs.writeFile(path, content, 'utf-8'),
    onError: (e) => FileError({ reason: `Cannot write ${path}: ${e}` }),
  });
  return t.then(toResultTry());
}
```

### Classifying Errors for Retry Decisions

```typescript
import { classifyError, tryPromise } from '@deessejs/fp';

class NetworkError extends Error {}
class TimeoutError extends Error {}
class AuthError extends Error {}

const rules = [
  { error: NetworkError, classification: 'retryable' as const },
  { error: TimeoutError, classification: 'retryable' as const },
  { error: AuthError, classification: 'non-retryable' as const },
];

async function smartFetch(url: string): Promise<Result<Response, Error>> {
  const t = await tryPromise(() => fetch(url));
  return pipe(
    t,
    matchTry({
      success: (response) => ok<Response, Error>(response),
      failure: (cause) => {
        const kind = classifyError(cause, rules);
        // the caller decides whether to retry based on `kind`
        return err<Response, Error>(cause);
      },
    }),
  );
}
```

## API Reference

### try_

Wraps a synchronous function that may throw.

```typescript
// Simple form — captures the cause inside an UnhandledException
function try_<T>(thunk: () => T): Try<T, UnhandledException>;

// With a custom error mapper
function try_<T, E>(options: {
  readonly onSuccess: () => T;
  readonly onError: (cause: unknown) => E;
}): Try<T, E>;
```

### tryPromise

Wraps an asynchronous function that may reject.

```typescript
// Simple form
function tryPromise<T>(thunk: () => Promise<T>): Promise<Try<T, UnhandledException>>;

// With a custom error mapper (onError may itself be async)
function tryPromise<T, E>(options: {
  readonly onSuccess: () => Promise<T>;
  readonly onError: (cause: unknown) => E | Promise<E>;
}): Promise<Try<T, E>>;
```

### success / failure

Construct a `Try<T, E>` directly. The `success()` and `failure()`
factories are the only public entry points into the internal
`SuccessImpl` / `FailureImpl` classes.

```typescript
function success<T, E = never>(value: T): Success<T, E>;
function failure<T = never, E = never>(cause: E): Failure<T, E>;
```

### Pipeable functions

Each pipeable has the shape `(args) => (operand) => result` and
delegates to the corresponding instance method on `Success` /
`Failure`.

| Pipeable | Behaviour |
|---|---|
| `mapTry(fn)` | Maps the Success value; passes Failure through. |
| `flatMapTry(fn)` | Binds through a function returning a `Try`. |
| `mapErrorTry(fn)` | Maps the Failure cause; passes Success through. |
| `tapTry(fn)` | Runs a side effect on Success; passes through. |
| `tapAsyncTry(fn)` | Async side effect on Success. |
| `flatMapAsyncTry(fn)` | Binds through a `Promise<Try>`. |
| `matchTry({ success, failure })` | Pattern matching. |
| `foldTry(onSuccess, onFailure)` | Pick one of two functions. |
| `getOrElseTry(default)` | Default value on Failure. |
| `getOrThrowTry(message?)` | Throw on Failure. |
| `getOrNullTry()` / `getOrUndefinedTry()` | Coerce Failure to `null` / `undefined`. |
| `toResultTry()` | Convert to `Result<T, E>`. |
| `isSuccess(t)` / `isFailure(t)` | Type guards. |

### attempt

Create a configured attempt with options for error normalization and a
single retry.

```typescript
interface AttemptConfig<T> {
  readonly onSuccess: () => T | Promise<T>;
  readonly client?: boolean;
  readonly retry?: RetryConfig<unknown>;
  readonly normalize?: (e: unknown) => unknown;
}

interface Attempt<T> {
  execute(): Promise<Result<T, unknown>>;
  clientSafe(): Promise<Result<T, NormalizedError>>;
}

interface NormalizedError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly public: boolean;
}

interface RetryConfig<E> {
  readonly attempts: number;
  readonly delay: DelayStrategy;
  readonly onRetry?: (error: E, attempt: number) => void;
  readonly shouldRetry?: (error: E) => boolean;
}

type DelayStrategy =
  | { readonly kind: 'exponential'; readonly baseMs: number }
  | { readonly kind: 'linear'; readonly baseMs: number }
  | { readonly kind: 'constant'; readonly baseMs: number };

function attempt<T>(config: AttemptConfig<T>): Attempt<T>;
```

`attempt().execute()` performs at most one retry when
`retry.shouldRetry(cause)` returns `true`. A retry loop is not
implemented; the `RetryConfig` / `DelayStrategy` types ship for
forward compatibility.

### withReporting

Wrap an operation so that any caught error is forwarded to a
caller-supplied reporter.

```typescript
interface ErrorReporter {
  report(error: unknown, context: ErrorContext): void;
}
interface ErrorContext {
  readonly timestamp: number;
  readonly operation: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
interface ReportableError {
  readonly _tag: 'ReportableError';
  readonly message: string;
  readonly cause?: unknown;
}

function withReporting<T>(
  onSuccess: () => T | Promise<T>,
  operationName: string,
  reporter: ErrorReporter,
  metadata?: Readonly<Record<string, unknown>>,
): Promise<Result<T, ReportableError>>;
```

### classifyError

Match a thrown value against a list of rules and return a
classification for retry decisions.

```typescript
type ErrorClassification = 'retryable' | 'non-retryable';
interface ClassificationRule {
  readonly error: ErrorConstructor;
  readonly classification: ErrorClassification;
}
type ErrorConstructor = abstract new (...args: unknown[]) => Error;

function classifyError(
  e: unknown,
  rules: ClassificationRule[],
): ErrorClassification;
```

The default for an unknown error is `'non-retryable'`. Add a final
catch-all rule if you need the opposite.

### UnhandledException

```typescript
interface UnhandledException {
  readonly _tag: 'UnhandledException';
  readonly cause: unknown;
}
```

The shape placed in the `cause` field of a `Failure` when the
thunk-only overload of `try_` / `tryPromise` is used and the operation
throws without an explicit mapper.
