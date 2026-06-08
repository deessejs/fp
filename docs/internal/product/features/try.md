# Try

Wraps synchronous or asynchronous operations that may throw. Converts exceptions into `Result`.

## Why Try?

Never let exceptions escape silently. Every throwing function should be wrapped with `try_` or `tryPromise`.

```typescript
// Without Try - exception might slip through
function parseConfig(json: string) {
  return JSON.parse(json); // throws on invalid JSON
}

// With Try - errors are explicit
function parseConfig(json: string) {
  return try_(() => JSON.parse(json));
}
```

## Installation

```typescript
import { try_, tryPromise } from '@deessejs/fp';
```

## Real-World Examples

### JSON Configuration File

```typescript
import { try_, tryPromise } from '@deessejs/fp';
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
  return tryPromise(() => fs.readFile(path, 'utf-8'))
    .mapError(e => ConfigError({ reason: `Cannot read ${path}: ${e}` }))
    .flatMap(content => try_({
      try: () => JSON.parse(content) as unknown,
      catch: e => ParseError({ cause: e }),
    }))
    .map(data => validateConfigSchema(data))
    .mapError(e => ConfigError({ reason: `Invalid config: ${e.message}` }));
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

### API Request with Error Handling

```typescript
import { tryPromise, retry, exponential, timeout } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ApiError = error({
  name: 'ApiError',
  message: 'API request failed: {cause}',
});

const NetworkError = error({
  name: 'NetworkError',
  message: 'Network error: {reason}',
});

// Robust API client
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<Result<T, ApiError | NetworkError>> {
  const robustFetch = retry({
    attempts: 3,
    delay: exponential(100),
    shouldRetry: (e) => e.message.includes('ECONNRESET'),
  });

  return timeout(10000, () =>
    robustFetch(() => fetch(url, options))
  ).mapError(e => {
    if (e instanceof TimeoutError) {
      return NetworkError({ reason: 'Request timed out' });
    }
    return NetworkError({ reason: e.message });
  }).flatMap(async response => {
    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error');
      return err(ApiError({ cause: `HTTP ${response.status}: ${body}` }));
    }

    return tryPromise(() => response.json() as Promise<T>)
      .mapError(e => ApiError({ cause: e }));
  });
}

// Get user with error handling
async function getUser(userId: string): Promise<Result<User, ApiError | NetworkError>> {
  return apiRequest<User>(`/api/users/${userId}`);
}

// Usage
app.get('/users/:id', async (req, res) => {
  const result = await getUser(req.params.id);

  result.match({
    ok: (user) => res.json(user),
    err: (e) => {
      if (is(e, NetworkError)) {
        res.status(503).json({ error: 'Service unavailable' });
      } else {
        res.status(500).json({ error: 'Internal error' });
      }
    },
  });
});
```

### Database Operations

```typescript
import { try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const DatabaseError = error({
  name: 'DatabaseError',
  message: 'Database operation failed: {cause}',
});

const QueryError = error({
  name: 'QueryError',
  message: 'Query error: {reason}',
});

// Safe database query
async function safeQuery<T>(
  query: string,
  params?: unknown[]
): Promise<Result<T[], DatabaseError>> {
  return tryPromise(() => db.query(query, params))
    .mapError(e => DatabaseError({ cause: e }));
}

// Safe transaction
async function safeTransaction<T>(
  fn: (client: DbClient) => Promise<T>
): Promise<Result<T, DatabaseError>> {
  return tryPromise(async () => {
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
  }).mapError(e => DatabaseError({ cause: e }));
}

// Safe insert with validation
async function insertUser(
  data: unknown
): Promise<Result<User, DatabaseError | QueryError>> {
  return try_({
    try: () => validateUserData(data),
    catch: (e) => QueryError({ reason: e.message }),
  }).flatMap(validData =>
    safeQuery<User>(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [validData.email, validData.name]
    ).map(rows => rows[0])
  );
}

// Usage
app.post('/users', async (req, res) => {
  const result = await insertUser(req.body);

  result.match({
    ok: (user) => res.status(201).json(user),
    err: (e) => {
      if (is(e, QueryError)) {
        res.status(400).json({ error: e.message });
      } else {
        res.status(500).json({ error: 'Database error' });
      }
    },
  });
});
```

### Client-Safe Error Handling

Never expose raw internal errors to clients. Normalize them to safe, public-facing types.

```typescript
import { try_, tryPromise, attempt } from '@deessejs/fp';
import { error } from '@deessejs/errors';

// Internal errors (never expose to clients)
const InternalError = error({
  name: 'InternalError',
  message: 'Internal error: {cause}',
});

const DatabaseError = error({
  name: 'DatabaseError',
  message: 'Database error: {cause}',
});

// Public errors (safe to expose)
const PublicError = error({
  name: 'PublicError',
  message: '{message}',
});

// Normalize internal errors to public ones
function toPublicError(e: unknown): PublicError {
  if (is(e, DatabaseError)) {
    return PublicError({ message: 'Service temporarily unavailable' });
  }
  if (is(e, InternalError)) {
    return PublicError({ message: 'An unexpected error occurred' });
  }
  // Unknown errors get sanitized
  if (e instanceof Error) {
    return PublicError({ message: 'An error occurred' });
  }
  return PublicError({ message: 'Unknown error' });
}

// Client-safe API wrapper
async function clientSafe<T>(
  operation: () => Promise<T>
): Promise<Result<T, PublicError>> {
  return tryPromise(operation).mapError(toPublicError);
}

// Usage in API handler
app.get('/api/data', async (req, res) => {
  const result = await clientSafe(() => fetchData(req.params.id));

  res.json(serialize(result));
  // Client receives: { status: "error", error: { name: "PublicError", message: "..." } }
  // Never: { status: "error", error: { name: "DatabaseError", cause: ConnectionRefused, stack: "..." } }
});
```

### Error Normalization Interface

Define a consistent normalization strategy for your entire application.

```typescript
import { tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

// Define your error taxonomy
const NetworkError = error({
  name: 'NetworkError',
  message: 'Network error: {reason}',
});

const AuthError = error({
  name: 'AuthError',
  message: 'Authentication failed: {reason}',
});

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

// Normalizer maps internal errors to public responses
type ErrorNormalizer<E> = (e: E) => NormalizedError;

interface NormalizedError {
  code: string;
  message: string;
  status: number;
  public: boolean;
}

const normalizers: Record<string, ErrorNormalizer<unknown>> = {
  NetworkError: (e) => ({
    code: 'NETWORK_ERROR',
    message: 'Unable to connect. Please check your connection.',
    status: 503,
    public: true,
  }),
  AuthError: (e) => ({
    code: 'AUTH_ERROR',
    message: 'Authentication required.',
    status: 401,
    public: true,
  }),
  ValidationError: (e) => ({
    code: 'VALIDATION_ERROR',
    message: e.message,
    status: 400,
    public: true,
  }),
};

// Generic safe wrapper with normalization
async function safeApi<T>(
  operation: () => Promise<T>
): Promise<Result<T, NormalizedError>> {
  return tryPromise(operation).mapError((e) => {
    const normalizer = normalizers[e.constructor.name];
    return normalizer ? normalizer(e) : {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      status: 500,
      public: false,
    };
  });
}
```

### Server/Client Error Boundaries

Different error handling strategies for server and client contexts.

```typescript
import { try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

// Server-side: rich error tracking
const ServerError = error({
  name: 'ServerError',
  message: 'Server error: {cause}',
});

async function serverOperation<T>(
  operation: () => Promise<T>,
  context: { requestId: string; userId?: string }
): Promise<Result<T, ServerError>> {
  return tryPromise(operation)
    .mapError(e => ServerError({
      cause: e,
    }))
    .tap(result => {
      // Log for monitoring
      if (result.isErr()) {
        logger.error({
          requestId: context.requestId,
          userId: context.userId,
          error: result.error,
          stack: result.error.cause instanceof Error
            ? result.error.cause.stack
            : undefined,
        });
      }
    });
}

// Client-side: safe error display
const ClientError = error({
  name: 'ClientError',
  message: '{message}',
});

async function clientOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T, ClientError>> {
  return tryPromise(operation).mapError(e => {
    // Extract safe message, never expose internals
    if (e instanceof Error) {
      return ClientError({ message: sanitizeMessage(e.message) });
    }
    return ClientError({ message: 'Something went wrong' });
  });
}

// Shared safe wrapper for cross-platform code
async function safe<T>(
  operation: () => Promise<T>,
  options?: {
    onError?: (e: unknown) => void;
    context?: 'server' | 'client';
  }
): Promise<Result<T, ClientError | ServerError>> {
  return tryPromise(operation).mapError(e => {
    options?.onError?.(e);

    if (options?.context === 'server') {
      return ServerError({ cause: e });
    }

    // Default to client-safe
    return ClientError({
      message: e instanceof Error
        ? sanitizeMessage(e.message)
        : 'Unknown error',
    });
  });
}
```

### Retry with Error Classification

Combine retry with error classification to selectively retry only recoverable errors.

```typescript
import { tryPromise, retry, exponential, constant } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const NetworkError = error({
  name: 'NetworkError',
  message: 'Network error: {reason}',
});

const TimeoutError = error({
  name: 'TimeoutError',
  message: 'Request timed out: {reason}',
});

const AuthError = error({
  name: 'AuthError',
  message: 'Authentication failed: {reason}',
});

// Classify errors for retry decisions
type RetryableError = NetworkError | TimeoutError;
type NonRetryableError = AuthError;

function classifyError(e: unknown): 'retryable' | 'non-retryable' {
  if (is(e, AuthError)) return 'non-retryable';
  if (is(e, NetworkError) || is(e, TimeoutError)) return 'retryable';
  // Unknown errors: retry once
  return 'retryable';
}

// Smart retry with error classification
async function smartRetry<T>(
  operation: () => Promise<T>
): Promise<Result<T, RetryableError | NonRetryableError>> {
  return retry({
    attempts: 3,
    delay: exponential(100),
    shouldRetry: (e) => classifyError(e) === 'retryable',
    onRetry: (e, attempt) => {
      console.warn(`Retry ${attempt}:`, e.message);
    },
  })(operation);
}

// Usage
async function fetchWithSmartRetry(url: string) {
  return smartRetry(() => fetch(url)).mapError(e => {
    if (is(e, NetworkError)) {
      return NetworkError({ reason: `Failed to fetch ${url}` });
    }
    return e;
  });
}
```

### Custom Error Reporters

Attach metadata and context to errors for better debugging.

```typescript
import { try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ReportableError = error({
  name: 'ReportableError',
  message: '{message}',
});

// Error reporter interface
interface ErrorReporter {
  report(error: unknown, context: ErrorContext): void;
}

interface ErrorContext {
  timestamp: number;
  operation: string;
  metadata?: Record<string, unknown>;
}

// Console reporter for development
const consoleReporter: ErrorReporter = {
  report(error, context) {
    console.error(`[${context.operation}]`, {
      error,
      ...context.metadata,
      timestamp: new Date(context.timestamp).toISOString(),
    });
  },
};

// Metrics reporter for production
const metricsReporter: ErrorReporter = {
  report(error, context) {
    metrics.increment('error.count', {
      operation: context.operation,
      error_type: error instanceof Error ? error.name : 'unknown',
    });
  },
};

// Combined reporter
const reporter: ErrorReporter = {
  report(error, context) {
    consoleReporter.report(error, context);
    if (process.env.NODE_ENV === 'production') {
      metricsReporter.report(error, context);
    }
  },
};

// Wrapper with reporting
function withReporting<T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata?: Record<string, unknown>
): Promise<Result<T, ReportableError>> {
  return tryPromise(operation)
    .mapError(e => {
      reporter.report(e, {
        timestamp: Date.now(),
        operation: operationName,
        metadata,
      });
      return ReportableError({
        message: e instanceof Error ? e.message : 'Operation failed',
      });
    });
}

// Usage
const result = await withReporting(
  () => processPayment(order),
  'processPayment',
  { orderId: order.id, amount: order.total }
);
```

### File System Operations

```typescript
import { try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const FileError = error({
  name: 'FileError',
  message: 'File operation failed: {cause}',
});

// Read file safely
async function readFile(path: string): Promise<Result<string, FileError>> {
  return tryPromise(() => fs.readFile(path, 'utf-8'))
    .mapError(e => FileError({ reason: `Cannot read ${path}: ${e}` }));
}

// Write file safely
async function writeFile(
  path: string,
  content: string
): Promise<Result<void, FileError>> {
  return tryPromise(() => fs.writeFile(path, content, 'utf-8'))
    .mapError(e => FileError({ reason: `Cannot write ${path}: ${e}` }));
}

// Atomic write (write to temp, then rename)
async function atomicWrite(
  path: string,
  content: string
): Promise<Result<void, FileError>> {
  const tempPath = `${path}.${Date.now()}.tmp`;

  return writeFile(tempPath, content)
    .flatMap(() => tryPromise(() => fs.rename(tempPath, path))
      .mapError(e => FileError({ reason: `Cannot rename ${tempPath}: ${e}` }))
    );
}

// Read multiple files
async function readConfigFiles(
  paths: string[]
): Promise<Result<Record<string, string>, FileError>> {
  const results = await Promise.all(
    paths.map(p => readFile(p).catch(() => err(FileError({ reason: `Failed: ${p}` }))))
  );

  const [oks, errs] = partition(results);

  if (errs.length > 0) {
    return err(errs[0].error);
  }

  const config: Record<string, string> = {};
  paths.forEach((path, i) => {
    config[path] = oks[i].value;
  });

  return ok(config);
}

// Usage
async function loadSettings() {
  const result = await readConfigFiles([
    './default-settings.json',
    './user-settings.json',
    process.env.SETTINGS_PATH ?? '',
  ].filter(Boolean));

  return result.map(configs => mergeConfigs(...Object.values(configs)));
}
```

## API Reference

### try_

Wraps a synchronous function that may throw.

```typescript
// Simple form
function try_<A>(thunk: () => A): Result<A, UnhandledException>;

// With custom error handler
function try_<A, E>(options: {
  try: () => A;
  catch: (cause: unknown) => E;
}): Result<A, E>;
```

### tryPromise

Wraps an async function that may reject.

```typescript
// Simple form
function tryPromise<A>(
  thunk: () => Promise<A>
): Promise<Result<A, UnhandledException>>;

// With custom error handler
function tryPromise<A, E>(options: {
  try: () => Promise<A>;
  catch: (cause: unknown) => E | Promise<E>;
}): Promise<Result<A, E>>;

// With retry
function tryPromise<A, E>(
  thunk: () => Promise<A>,
  config: RetryConfig<E>
): Promise<Result<A, E>>;
```

### attempt (Advanced)

Creates a configured attempt with options for client-safe errors, retry, and normalization.

```typescript
// Create attempt with options
function attempt<T>(config: AttemptConfig<T>): Attempt<T>;

// Attempt configuration
interface AttemptConfig<T> {
  try: () => T | Promise<T>;
  client?: boolean; // Normalize errors for client exposure
  retry?: RetryConfig<unknown>;
  normalize?: (e: unknown) => unknown;
}

// Attempt result
interface Attempt<T> {
  execute(): Promise<Result<T, unknown>>;
  clientSafe(): Promise<Result<T, NormalizedError>>;
}

// Normalized error for client-safe responses
interface NormalizedError {
  code: string;
  message: string;
  status: number;
  public: boolean;
}
```

### Error Normalization

```typescript
// Error normalizer function
type ErrorNormalizer<E> = (e: E) => NormalizedError;

// Sanitize error message for clients
function sanitizeMessage(message: string): string;

// Create client-safe error
function toClientSafe<T>(
  operation: () => Promise<T>,
  normalizer: ErrorNormalizer<unknown>
): Promise<Result<T, NormalizedError>>;
```

### Error Classification

```typescript
// Classify error for retry decisions
type ErrorClassification = 'retryable' | 'non-retryable';

function classifyError(
  e: unknown,
  rules: ClassificationRule[]
): ErrorClassification;

interface ClassificationRule {
  error: ErrorFactory;
  classification: ErrorClassification;
}
```

### Error Reporting

```typescript
// Error reporter interface
interface ErrorReporter {
  report(error: unknown, context: ErrorContext): void;
}

interface ErrorContext {
  timestamp: number;
  operation: string;
  metadata?: Record<string, unknown>;
}

// Wrap operation with reporting
function withReporting<T>(
  operation: () => Promise<T>,
  operationName: string,
  reporter: ErrorReporter,
  metadata?: Record<string, unknown>
): Promise<Result<T, ReportableError>>;
```

### Retry Configuration

```typescript
interface RetryConfig<E> {
  attempts: number;
  delay: DelayStrategy;
  onRetry?: (error: E, attempt: number) => void;
  shouldRetry?: (error: E) => boolean;
}

type DelayStrategy =
  | typeof exponential(baseMs: number)
  | typeof linear(baseMs: number)
  | typeof constant(baseMs: number);
```

### UnhandledException

```typescript
// Error when no custom handler is provided
interface UnhandledException {
  readonly name: 'UnhandledException';
  readonly cause: unknown;
}
```