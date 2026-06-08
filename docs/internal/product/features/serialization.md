# Serialization

Serialize and deserialize Results for RPC, server actions, or storage.

## Why Serialize?

Results need to cross boundaries: server actions, API responses, storage. Serialization makes this safe and type-safe.

```typescript
// Without serialization
async function getUser(id: string) {
  try {
    return await db.getUser(id);
  } catch (e) {
    return { error: e.message }; // What type is this?
  }
}

// With serialization
async function getUser(id: string) {
  return serialize(await db.getUser(id));
  // Always returns { status: "ok", value: ... } or { status: "error", error: ... }
}
```

## Installation

```typescript
import { Result, ok, err, serialize, deserialize } from '@deessejs/fp';
```

## Real-World Examples

### Next.js Server Actions

```typescript
import { Result, ok, err, serialize, deserialize } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ValidationError = error({
  name: 'ValidationError',
  message: 'Validation failed: {reason}',
});

// Server action
export async function createUser(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  // Validate
  if (!email.includes('@')) {
    return serialize(err(ValidationError({ reason: 'Invalid email' })));
  }

  // Create user
  const result = await userService.create({ email, name });

  return serialize(result);
}

// Client component
'use client';

function CreateUserForm() {
  const [result, setResult] = useState<SerializedResult<User, ValidationError>>();

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serialized = await createUser(formData);
    setResult(serialized);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="name" type="text" />
      <button type="submit">Create</button>

      {result && (
        <ResultView result={deserialize(result)} />
      )}
    </form>
  );
}

function ResultView({ result }: { result: Result<User, ValidationError> }) {
  return result.match({
    ok: (user) => <p>Created: {user.email}</p>,
    err: (e) => <p className="error">{e.message}</p>,
  });
}
```

### API Responses

```typescript
import { serialize, deserialize } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const ApiError = error({
  name: 'ApiError',
  message: '{reason}',
});

// Express middleware
app.get('/api/users/:id', async (req, res) => {
  const userResult = await userService.getById(req.params.id);

  res.json(serialize(userResult));
});

// Client
async function fetchUser(id: string): Promise<Result<User, ApiError>> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  return deserialize(data);
}

// Usage
const user = await fetchUser('123');

user.match({
  ok: (u) => console.log('User:', u),
  err: (e) => console.error('Failed:', e.message),
});
```

### LocalStorage / IndexedDB

```typescript
import { serialize, deserialize } from '@deessejs/fp';
import { error } from '@deessejs/errors';

const StorageError = error({
  name: 'StorageError',
  message: 'Storage error: {reason}',
});

// Save to localStorage
async function saveUserSession(userResult: Result<User, StorageError>) {
  const serialized = serialize(userResult);
  localStorage.setItem('user_session', JSON.stringify(serialized));
}

// Load from localStorage
function loadUserSession(): Result<User, StorageError> {
  try {
    const stored = localStorage.getItem('user_session');
    if (!stored) {
      return err(StorageError({ reason: 'No session found' }));
    }

    const data = JSON.parse(stored);
    return deserialize(data);
  } catch (e) {
    return err(StorageError({ reason: 'Failed to load session' }));
  }
}

// IndexedDB wrapper
const db = await openDB('myapp', 1, {
  upgrade(db) {
    db.createObjectStore('results');
  },
});

async function saveResult<T, E>(store: string, key: string, result: Result<T, E>) {
  const serialized = serialize(result);
  await db.put(store, serialized, key);
}

async function loadResult<T, E>(store: string, key: string): Promise<Result<T, E>> {
  const serialized = await db.get(store, key);
  return deserialize(serialized);
}
```

### RPC / Cross-Worker Communication

```typescript
import { serialize, deserialize } from '@deessejs/fp';

// Web Worker
const worker = new Worker('processor.js');

worker.onmessage = (event: MessageEvent) => {
  const request = event.data as SerializedResult<Request, unknown>;

  // Deserialize request
  const result = deserialize<Request, Error>(request);

  // Process
  result.match({
    ok: (req) => {
      const response = processRequest(req);
      worker.postMessage(serialize(ok(response)));
    },
    err: (e) => {
      worker.postMessage(serialize(err(e)));
    },
  });
};

// Main thread
const response = await new Promise<Result<Response, Error>>((resolve) => {
  worker.onmessage = (event) => {
    resolve(deserialize(event.data));
  };
  worker.postMessage(serialize(ok({ data: 'request' })));
});

// MessagePort communication
const channel = new MessageChannel();

channel.port1.onmessage = (event) => {
  const result = deserialize(event.data);
  // Handle result
};

channel.port2.postMessage(serialize(ok({ type: 'init' })));
```

### Batch Operations

```typescript
import { serialize, deserialize, partition } from '@deessejs/fp';

// Process multiple items, serialize results
async function processBatch(items: Item[]) {
  const results = await Promise.all(
    items.map(item => processItem(item).catch(e => err(e as Error)))
  );

  const [successes, errors] = partition(results);

  return {
    processed: successes.map(r => r.value),
    failed: errors.map(r => r.error),
    serialized: serialize(results), // For logging/transmission
  };
}

// Restore from serialized state
async function restoreBatch(serialized: SerializedResult<Item, Error>[]) {
  return serialized.map(s => deserialize(s));
}

// Distributed processing
async function submitJob(job: Job): Promise<string> {
  const jobId = generateId();

  // Store initial state
  await db.save('jobs', jobId, serialize(ok({ job, status: 'pending', progress: 0 })));

  // Queue for processing
  await queue.add(async () => {
    const state = await db.load('jobs', jobId);
    const result = deserialize(state);

    return result.flatMap(async (s) => {
      const updated = await processJob(s.job);
      await db.save('jobs', jobId, serialize(ok({ ...s, status: 'completed', result: updated })));
      return ok(updated);
    });
  });

  return jobId;
}
```

## Type Definitions

```typescript
type SerializedOk<T> = {
  status: "ok";
  value: T;
};

type SerializedErr<E> = {
  status: "error";
  error: E;
};

type SerializedResult<T, E> = SerializedOk<T> | SerializedErr<E>;
```

## API Reference

### serialize

Converts a Result to a plain object for serialization.

```typescript
function serialize<T, E>(result: Result<T, E>): SerializedResult<T, E>;
```

### deserialize

Rehydrates a serialized Result back into Ok/Err instances.

```typescript
function deserialize<T, E>(
  value: unknown
): Result<T, E | DeserializationError>;
```

### Types

```typescript
// Serialized Ok variant
type SerializedOk<T> = {
  status: "ok";
  value: T;
};

// Serialized Err variant
type SerializedErr<E> = {
  status: "error";
  error: E;
};

// Union of both variants
type SerializedResult<T, E> = SerializedOk<T> | SerializedErr<E>;

// Error when deserialization fails
interface DeserializationError {
  readonly name: 'DeserializationError';
  readonly value: unknown;
}
```

### partition

Splits an array of Results into successes and failures.

```typescript
function partition<T, E>(
  results: readonly Result<T, E>[]
): [T[], E[]];
```