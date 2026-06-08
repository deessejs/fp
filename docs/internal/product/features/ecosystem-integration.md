# Ecosystem Integration

## @deessejs/errors

First-class support for structured errors from [@deessejs/errors](https://errors.deessejs.com).

### Installation

```typescript
import { Result, ok, err, try_ } from '@deessejs/fp';
import { error, raise, is } from '@deessejs/errors';
```

### Why @deessejs/errors?

`@deessejs/errors` provides:
- **Exception chaining** via `.from()`
- **Hierarchical inheritance** for domain error taxonomies
- **Message templates** with `{placeholder}` replacement
- **Type guards** via `is()`
- **Cause traversal** via `causes()`
- **Schema validation** support (Zod, Valibot, etc.)

## Real-World Examples

### Error Hierarchy for a SaaS Application

```typescript
import { error } from '@deessejs/errors';

// Base application error
const AppError = error({
  name: 'AppError',
  message: 'Application error: {reason}',
});

// Validation errors
const ValidationError = AppError.child({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

// Resource errors
const NotFoundError = AppError.child({
  name: 'NotFoundError',
  message: 'Resource "{id}" not found',
});

const ConflictError = AppError.child({
  name: 'ConflictError',
  message: 'Resource conflict: {reason}',
});

// External service errors
const ExternalServiceError = AppError.child({
  name: 'ExternalServiceError',
  message: 'External service error: {service}',
});

const DatabaseError = ExternalServiceError.child({
  name: 'DatabaseError',
  message: 'Database error: {cause}',
});

const PaymentError = ExternalServiceError.child({
  name: 'PaymentError',
  message: 'Payment failed: {reason}',
});

const EmailError = ExternalServiceError.child({
  name: 'EmailError',
  message: 'Email service error: {reason}',
});
```

### Full Stack Error Handling

```typescript
import { Result, ok, err, try_, gen } from '@deessejs/fp';
import { error, is } from '@deessejs/errors';

// Error definitions
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
  message: 'Database error: {cause}',
});

// User service with comprehensive error handling
async function getUserWithOrders(userId: string): Promise<Result<UserWithOrders, ValidationError | NotFoundError | DatabaseError>> {
  return gen(async function* () {
    // Validate input
    if (!userId || userId.length < 1) {
      return err(ValidationError({ field: 'id', reason: 'Invalid ID' }));
    }

    // Get user
    const user = yield* await tryPromise(() => db.users.findById(userId))
      .mapError(e => DatabaseError({ cause: e }))
      .flatMap(user => user
        ? ok(user)
        : err(NotFoundError({ id: userId }))
      );

    // Get orders
    const orders = yield* await tryPromise(() => db.orders.findByUserId(userId))
      .mapError(e => DatabaseError({ cause: e }));

    return ok({ user, orders });
  });
}

// Express error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle @deessejs/errors
  if (is(err, ValidationError)) {
    res.status(400).json({
      error: err.message,
      fields: err.fields,
      type: 'validation',
    });
    return;
  }

  if (is(err, NotFoundError)) {
    res.status(404).json({
      error: err.message,
      resourceId: err.fields.id,
      type: 'not_found',
    });
    return;
  }

  if (is(err, DatabaseError)) {
    console.error('Database error:', err.cause);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      type: 'database',
    });
    return;
  }

  // Unknown error
  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'Internal server error',
    type: 'unknown',
  });
});

// API route
app.get('/users/:id/orders', async (req, res) => {
  const result = await getUserWithOrders(req.params.id);

  res.json(
    result.match({
      ok: ({ user, orders }) => ({ user, orders }),
      err: (e) => {
        // This will be caught by error handler
        throw e;
      },
    })
  );
});
```

### Nested Validation with Cause Chaining

```typescript
import { try_ } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ParseError = error({
  name: 'ParseError',
  message: 'Parse error: {cause}',
});

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation error: {reason}',
});

// Parse with error chaining
function parseConfig(content: string): Result<Config, ParseError | ValidationError> {
  return try_({
    try: () => JSON.parse(content) as unknown,
    catch: (cause) => ParseError({ cause }),
  }).flatMap(data => {
    // Validate with cause propagation
    const errors = validateConfig(data);
    if (errors.length > 0) {
      return err(ValidationError({ reason: errors.join(', ') }));
    }
    return ok(data as Config);
  });
}

// Nested service call with exception chaining
async function saveUser(user: unknown): Promise<Result<User, DatabaseError | ValidationError>> {
  return try_({
    try: () => db.users.create(user),
    catch: (cause) => {
      if (cause instanceof UniqueConstraintError) {
        return DatabaseError({ cause: 'Email already exists' });
      }
      return DatabaseError({ cause });
    },
  }).mapError(e => {
    if (is(e, DatabaseError) && e.cause === 'Email already exists') {
      return ValidationError({ field: 'email', reason: 'Email already registered' });
    }
    return e;
  });
}
```

### Error Traversal with causes()

```typescript
import { try_, gen } from '@deessejs/fp';
import { error, causes } from '@deessejs/errors';

const DatabaseError = error({
  name: 'DatabaseError',
  message: 'Database error: {cause}',
});

const ExternalServiceError = error({
  name: 'ExternalServiceError',
  message: 'External service error: {cause}',
});

// Error with deep cause chain
async function fetchUserData(userId: string) {
  return gen(async function* () {
    try {
      const user = yield* await tryPromise(() => api.getUser(userId))
        .mapError(e => ExternalServiceError({ cause: e }));

      const profile = yield* await tryPromise(() => api.getProfile(user.id))
        .mapError(e => ExternalServiceError({ cause: e }).from(e));

      return ok({ user, profile });
    } catch (e) {
      // Wrap in database error with full cause chain
      return err(DatabaseError({ cause: e }).from(e));
    }
  });
}

// Log full error chain
async function handleError(result: Result<UserData, DatabaseError | ExternalServiceError>) {
  if (result.isErr()) {
    console.error('Error chain:');

    for (const error of causes(result.error)) {
      console.log(`  - ${error.name}: ${error.message}`);
      if (error.cause) {
        console.log(`    caused by: ${error.cause}`);
      }
    }
  }
}
```

### Type-Safe Error Matching

```typescript
import { Result, ok, err, gen } from '@deessejs/fp';
import { error, is } from '@deessejs/errors';

const AppError = error({
  name: 'AppError',
  message: '{reason}',
});

const ValidationError = AppError.child({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

const NotFoundError = AppError.child({
  name: 'NotFoundError',
  message: 'Resource not found: {id}',
});

const UnauthorizedError = AppError.child({
  name: 'UnauthorizedError',
  message: 'Unauthorized: {reason}',
});

// Type-safe error handling
async function processRequest(req: Request): Promise<Result<Response, AppError>> {
  return gen(async function* () {
    // ... processing logic
    return ok({ status: 200, body: 'OK' });
  });
}

// Handler with exhaustive checking
app.use(async (req, res, next) => {
  const result = await processRequest(req);

  if (result.isErr()) {
    const error = result.error;

    // TypeScript ensures all error types are handled
    type ErrorType = typeof error extends AppError ? typeof error : never;

    if (is(error, ValidationError)) {
      res.status(400).json({
        type: 'validation',
        message: error.message,
        fields: error.fields,
      });
    } else if (is(error, NotFoundError)) {
      res.status(404).json({
        type: 'not_found',
        message: error.message,
        id: error.fields.id,
      });
    } else if (is(error, UnauthorizedError)) {
      res.status(401).json({
        type: 'unauthorized',
        message: error.message,
      });
    } else {
      // Fallback for AppError
      res.status(500).json({
        type: 'error',
        message: error.message,
      });
    }
    return;
  }

  res.json(result.value);
});
```

## Other @deessejs Packages

This library is the core of the `@deessejs` ecosystem:

- **[@deessejs/errors](https://errors.deessejs.com)** — Structured error handling

Each package is independent and can be used standalone or together.

## API Reference

### @deessejs/errors Integration

When using `@deessejs/errors` with `@deessejs/fp`, the following patterns are supported:

```typescript
// error factory from @deessejs/errors
function error<T extends object>(config: ErrorConfig<T>): ErrorFactory<T>;

// Error instance methods
interface ErrorInstance {
  from(cause: unknown): this;
  fields: T;
  message: string;
  cause: unknown;
  _tag: string;
}

// Type guard from @deessejs/errors
function is(value: unknown, error: ErrorFactory): value is ErrorInstance;
```

### Pattern Summary

| Pattern | @deessejs/fp | @deessejs/errors |
|---------|--------------|------------------|
| Create error | `err(new Error(...))` | `error({ name: 'Error', message: '...' })` |
| Check type | `result.isErr()` | `is(result.error, ErrorType)` |
| Get fields | `result.error` | `result.error.fields` |
| Chain errors | N/A | `error.from(cause)` |
| Create child | N/A | `ParentError.child({...})` |