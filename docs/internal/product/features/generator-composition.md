# Generator Composition

Chain multiple Results using generator syntax — no nested callbacks.

## Why Generator Composition?

Write sequential-looking code that handles errors automatically. No more pyramid of doom.

```typescript
// Without gen - nested callbacks
function fetchUserData(userId: string) {
  return getUser(userId).flatMap(user => {
    return getPosts(user.id).flatMap(posts => {
      return getComments(posts.map(p => p.id)).flatMap(comments => {
        return ok({ user, posts, comments });
      });
    });
  });
}

// With gen - clean and sequential
function fetchUserData(userId: string) {
  return gen(function* () {
    const user = yield* getUser(userId);
    const posts = yield* getPosts(user.id);
    const comments = yield* getComments(posts.map(p => p.id));
    return ok({ user, posts, comments });
  });
}
```

## Installation

```typescript
import { Result, ok, err, gen } from '@deessejs/fp';
```

## Real-World Examples

### Multi-Step Registration Flow

```typescript
import { Result, ok, err, gen, try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

const DatabaseError = error({
  name: 'DatabaseError',
  message: 'Database error: {cause}',
});

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteCode?: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode: string;
}

// Validate input
function validateInput(input: RegisterInput): Result<RegisterInput, ValidationError> {
  if (!input.email.includes('@')) {
    return err(ValidationError({ reason: 'Invalid email' }));
  }
  if (input.password.length < 8) {
    return err(ValidationError({ reason: 'Password too short' }));
  }
  return ok(input);
}

// Check if email exists
async function isEmailTaken(email: string): Promise<Result<boolean, DatabaseError>> {
  return tryPromise(() => db.users.exists({ email }))
    .mapError(e => DatabaseError({ cause: e }));
}

// Register user
async function registerUser(input: RegisterInput): Promise<Result<RegisteredUser, ValidationError | DatabaseError>> {
  return gen(async function* () {
    // Step 1: Validate
    const valid = yield* validateInput(input);

    // Step 2: Check email availability
    const emailTaken = yield* await isEmailTaken(valid.email);
    if (emailTaken) {
      return err(ValidationError({ reason: 'Email already registered' }));
    }

    // Step 3: Process invite code
    let referralCode = '';
    if (valid.inviteCode) {
      const referrer = yield* await findUserByReferralCode(valid.inviteCode);
      if (referrer.isErr()) {
        return err(ValidationError({ reason: 'Invalid invite code' }));
      }
      referralCode = valid.inviteCode;
    }

    // Step 4: Create user
    const user = yield* await tryPromise(() =>
      db.users.create({
        email: valid.email,
        password: await hashPassword(valid.password),
        firstName: valid.firstName,
        lastName: valid.lastName,
        referralCode: generateReferralCode(),
      })
    ).mapError(e => DatabaseError({ cause: e }));

    // Step 5: Send welcome email
    yield* await tryPromise(() =>
      email.send({
        to: user.email,
        template: 'welcome',
        data: { firstName: user.firstName },
      })
    ).mapError(e => DatabaseError({ cause: e }));

    return ok(user);
  });
}

// Usage
app.post('/register', async (req, res) => {
  const result = await registerUser(req.body);

  result.match({
    ok: (user) => res.status(201).json({ userId: user.id }),
    err: (e) => {
      if (is(e, ValidationError)) {
        res.status(400).json({ error: e.message, fields: e.fields });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    },
  });
});
```

### Checkout Flow with Multiple Services

```typescript
import { Result, ok, err, gen, try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const CartError = error({ name: 'CartError', message: '{reason}' });
const PaymentError = error({ name: 'PaymentError', message: '{reason}' });
const InventoryError = error({ name: 'InventoryError', message: '{reason}' });

interface CheckoutInput {
  userId: string;
  cartId: string;
  paymentMethodId: string;
  shippingAddressId: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped';
}

// Full checkout process
async function checkout(input: CheckoutInput): Promise<Result<Order, CartError | PaymentError | InventoryError>> {
  return gen(async function* () {
    // 1. Get cart with items
    const cart = yield* await getCart(input.cartId)
      .mapError(e => CartError({ reason: e.message }));

    if (cart.items.length === 0) {
      return err(CartError({ reason: 'Cart is empty' }));
    }

    // 2. Verify inventory for all items
    const inventoryCheck = yield* await verifyInventory(cart.items)
      .mapError(e => InventoryError({ reason: e.message }));

    if (!inventoryCheck.available) {
      return err(InventoryError({
        reason: `Insufficient stock for: ${inventoryCheck.unavailableItems.join(', ')}`,
      }));
    }

    // 3. Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = calculateShipping(cart.items, input.shippingAddressId);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // 4. Process payment
    const paymentResult = yield* await chargePayment({
      methodId: input.paymentMethodId,
      amount: total,
      description: `Order ${cart.id}`,
    }).mapError(e => PaymentError({ reason: e.message }));

    // 5. Reserve inventory
    yield* await reserveInventory(cart.items)
      .mapError(e => InventoryError({ reason: e.message }));

    // 6. Create order
    const order = yield* await createOrder({
      userId: input.userId,
      items: cart.items,
      subtotal,
      shipping,
      tax,
      total,
      paymentId: paymentResult.transactionId,
    }).mapError(e => CartError({ reason: e.message }));

    // 7. Clear cart
    yield* await clearCart(input.cartId)
      .mapError(e => CartError({ reason: e.message }));

    // 8. Send confirmation
    yield* await sendOrderConfirmation(order.id)
      .mapError(e => CartError({ reason: 'Failed to send confirmation' }));

    return ok(order);
  });
}
```

### Data Pipeline with Multiple Validations

```typescript
import { Result, ok, err, gen, try_, tryPromise } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const PipelineError = error({ name: 'PipelineError', message: '{reason}' });

interface RawData {
  id: string;
  timestamp: string;
  payload: unknown;
}

interface ProcessedData {
  id: string;
  timestamp: Date;
  valid: boolean;
  enriched: EnrichedData;
}

// Multi-stage data pipeline
async function processData(raw: RawData): Promise<Result<ProcessedData, PipelineError>> {
  return gen(async function* () {
    // Stage 1: Parse JSON
    const parsed = yield* try_(() => JSON.parse(raw.payload as string))
      .mapError(e => PipelineError({ reason: 'Invalid JSON' }));

    // Stage 2: Validate schema
    const validated = yield* validateSchema(parsed)
      .mapError(e => PipelineError({ reason: `Schema validation failed: ${e}` }));

    // Stage 3: Normalize timestamps
    const timestamp = yield* parseTimestamp(raw.timestamp)
      .mapError(e => PipelineError({ reason: `Invalid timestamp: ${e}` }));

    // Stage 4: Enrich data
    const enriched = yield* enrichData(validated)
      .mapError(e => PipelineError({ reason: `Enrichment failed: ${e}` }));

    return ok({
      id: raw.id,
      timestamp,
      valid: true,
      enriched,
    });
  });
}

// Process batch with error recovery
async function processBatch(items: RawData[]): Promise<{ processed: ProcessedData[]; failed: PipelineError[] }> {
  const results = await Promise.all(
    items.map(item => processData(item).catch(() => err(PipelineError({ reason: 'Unexpected error' })))
  );

  const [processed, errors] = partition(results);

  return {
    processed: processed.map(r => r.value),
    failed: errors.map(r => r.error),
  };
}
```

### API Request with Auth and Retry

```typescript
import { Result, ok, err, gen, retry, exponential } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const AuthError = error({ name: 'AuthError', message: '{reason}' });
const ApiError = error({ name: 'ApiError', message: '{reason}' });

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// Authenticated API request
async function authenticatedRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<Result<T, AuthError | ApiError>> {
  return gen(async function* () {
    // 1. Get or refresh token
    const token = yield* await getValidToken()
      .mapError(e => AuthError({ reason: e.message }));

    // 2. Make request with retry
    const response = yield* await retry({
      attempts: 3,
      delay: exponential(100),
      shouldRetry: (e) => e.status >= 500, // Only retry server errors
    })(async () => {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) {
        throw AuthError({ reason: 'Token expired' });
      }

      if (res.status >= 400) {
        const error = await res.json();
        throw ApiError({ reason: error.message ?? 'API error' });
      }

      return res.json() as T;
    }).mapError(e => ApiError({ reason: e.message }));

    return ok(response);
  });
}

// Get user with automatic token refresh
async function getUserProfile(userId: string): Promise<Result<User, AuthError | ApiError>> {
  return authenticatedRequest('GET', `/users/${userId}`);
}
```

## How It Works

The `yield*` syntax unwraps Results automatically:

- If the Result is `Ok`, `yield*` returns the value and continues
- If the Result is `Err`, `yield*` yields the error and **short-circuits** the generator

This gives you sequential-looking code with automatic error propagation.

## Short-Circuit Behavior

```typescript
const result = gen(function* () {
  const a = yield* ok(1);
  const b = yield* err('failed'); // Short-circuits here
  const c = yield* ok(3);         // Never executed
  return ok({ a, b, c });
});
// Err('failed')
```

## API Reference

### gen

Creates a Result from a generator function.

```typescript
// Synchronous generator
function gen<R extends AnyResult>(
  body: () => Generator<Result<unknown, unknown>, R, unknown>
): Result<InferOk<R>, InferErr<R>>;

// Synchronous generator with thisArg
function gen<R extends AnyResult, This>(
  body: (this: This) => Generator<Result<unknown, unknown>, R, unknown>,
  thisArg: This
): Result<InferOk<R>, InferErr<R>>;

// Async generator
function gen<R extends AnyResult>(
  body: () => AsyncGenerator<Result<unknown, unknown>, R, unknown>
): Promise<Result<InferOk<R>, InferErr<R>>>;

// Async generator with thisArg
function gen<R extends AnyResult, This>(
  body: (this: This) => AsyncGenerator<Result<unknown, unknown>, R, unknown>,
  thisArg: This
): Promise<Result<InferOk<R>, InferErr<R>>>;
```

### await

Wraps a Promise of Result to be yieldable in async generators.

```typescript
function await<T, E>(
  promise: Promise<Result<T, E>>
): AsyncGenerator<Err<never, E>, T, unknown>;
```

### Type Utilities

```typescript
// Extract Ok type from Result
type InferOk<R> = R extends Ok<infer T, unknown> ? T : never;

// Extract Err type from Result
type InferErr<R> = R extends Err<unknown, infer E> ? E : never;

// Base Result interface for type checking
interface AnyResult {
  isOk(): boolean;
  isErr(): boolean;
}
```