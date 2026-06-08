# Unit

The unit type for when you don't need a value. Represents "no meaningful return value".

## Why Unit?

In functional programming, every function returns a value. `Unit` makes explicit that a function performs a side effect without returning meaningful data.

```typescript
// Without Unit - ambiguous
function log(message: string): void {
  console.log(message);
  // Returns undefined - is this intentional or a bug?
}

// With Unit - explicit
function log(message: string): Unit {
  console.log(message);
  return unit;
}
```

## Installation

```typescript
import { Unit, unit } from '@deessejs/fp';
```

## Real-World Examples

### Side Effect Functions

```typescript
import { Unit, unit } from '@deessejs/fp';

// Logging service
interface Logger {
  log(message: string): Unit;
  error(message: string, error?: Error): Unit;
  warn(message: string): Unit;
}

const logger: Logger = {
  log(message: string): Unit {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    return unit;
  },
  error(message: string, error?: Error): Unit {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    return unit;
  },
  warn(message: string): Unit {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    return unit;
  },
};

// Analytics tracking
interface Analytics {
  track(event: string, properties?: Record<string, unknown>): Unit;
}

const analytics: Analytics = {
  track(event: string, properties = {}): Unit {
    // Send to analytics service
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties, timestamp: Date.now() }),
    }).catch(() => {}); // Fire and forget
    return unit;
  },
};
```

### Result with Side Effects

```typescript
import { Result, ok, err, Unit, unit } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

// Operation that returns Unit on success
interface OrderService {
  createOrder(data: OrderInput): Promise<Result<Unit, ValidationError | DatabaseError>>;
  cancelOrder(orderId: string): Promise<Result<Unit, NotFoundError | DatabaseError>>;
  sendConfirmation(orderId: string): Promise<Result<Unit, EmailError>>;
}

const orderService: OrderService = {
  async createOrder(data: OrderInput): Promise<Result<Unit, ValidationError | DatabaseError>> {
    // Validate
    if (!data.items.length) {
      return err(ValidationError({ reason: 'Order must have items' }));
    }

    // Create in database
    try {
      await db.orders.create(data);
      return ok(unit);
    } catch (e) {
      return err(DatabaseError({ cause: e }));
    }
  },
};

// Usage
app.post('/orders', async (req, res) => {
  const result = await orderService.createOrder(req.body);

  result.match({
    ok: () => res.status(201).json({ success: true }),
    err: (e) => {
      if (is(e, ValidationError)) {
        res.status(400).json({ error: e.message });
      } else {
        res.status(500).json({ error: 'Failed to create order' });
      }
    },
  });
});
```

### Effect Chains

```typescript
import { pipe, Unit, unit } from '@deessejs/fp';

// Process and log without returning meaningful value
const processAndLog = (data: Data): Unit => {
  // Process data
  const processed = transformData(data);

  // Log result
  console.log('Processed:', processed);

  return unit;
};

// Composable side effects
const logStart = (operation: string): Unit => {
  console.log(`Starting: ${operation}`);
  return unit;
};

const logEnd = (operation: string, duration: number): Unit => {
  console.log(`Completed: ${operation} (${duration}ms)`);
  return unit;
};

const logError = (operation: string, error: Error): Unit => {
  console.error(`Failed: ${operation}`, error);
  return unit;
};

// Timed operation
async function withLogging<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  logStart(operation);
  const start = Date.now();

  try {
    const result = await fn();
    logEnd(operation, Date.now() - start);
    return result;
  } catch (e) {
    logError(operation, e as Error);
    throw e;
  }
}

// Usage
const fetchUsers = () => withLogging('fetchUsers', () =>
  fetch('/api/users').then(r => r.json())
);
```

### Service Composition

```typescript
import { Unit, unit } from '@deessejs/fp';

// Email service interface
interface EmailService {
  send(to: string, template: string, data: unknown): Promise<Result<Unit, EmailError>>;
  sendBatch(to: string[], template: string, data: unknown): Promise<Result<Unit, EmailError>>;
}

// Notification service
interface NotificationService {
  notify(userId: string, message: string): Promise<Result<Unit, NotificationError>>;
  notifyAll(userIds: string[], message: string): Promise<Result<Unit, NotificationError>>;
}

// Combined service
interface AlertService {
  alert(severity: 'info' | 'warning' | 'critical', message: string): Promise<Result<Unit, Error>>;
}

function createAlertService(
  email: EmailService,
  notification: NotificationService,
  logger: Logger
): AlertService {
  return {
    async alert(severity, message): Promise<Result<Unit, Error>> {
      logger.log(`Alert [${severity}]: ${message}`);

      if (severity === 'critical') {
        // Send email
        const emailResult = await email.send('oncall@company.com', 'alert', { severity, message });
        if (emailResult.isErr()) {
          return err(emailResult.error);
        }

        // Send push notification
        const pushResult = await notification.notifyAll(['oncall-user-1', 'oncall-user-2'], message);
        if (pushResult.isErr()) {
          return err(pushResult.error);
        }
      }

      return ok(unit);
    },
  };
}
```

## In Result Context

```typescript
import { Result, ok, err, Unit } from '@deessejs/fp';

const processOrder = (order: Order): Result<Unit, Error> => {
  try {
    db.save(order);
    email.send(order.customer);
    inventory.reserve(order.items);
    return ok(unit);
  } catch (e) {
    return err(e as Error);
  }
};
```

## Type Definition

```typescript
// Unit is a singleton
type Unit = { readonly _tag: 'Unit' };

const unit: Unit = { _tag: 'Unit' };
```

## API Reference

### Types

```typescript
// Unit is a singleton type
type Unit = { readonly _tag: 'Unit' };
```

### Value

```typescript
// The singleton Unit value
const unit: Unit;
```

### Utilities

```typescript
// Check if a value is Unit
function isUnit(value: unknown): value is Unit;

// Unit as a Maybe (None variant)
function toMaybe(): Maybe<never>;
```