# Async Utilities

Promise-based utilities for async operations.

## Installation

```typescript
import { sleep, retry, timeout, queue } from '@deessejs/fp';
```

## Real-World Examples

### sleep — Rate Limiting & Debouncing

```typescript
import { sleep } from '@deessejs/fp';

// Rate limit API calls - wait between requests
async function fetchWithRateLimit(urls: string[]) {
  const results = [];
  for (const url of urls) {
    results.push(await fetch(url));
    await sleep(100); // Max 10 requests per second
  }
  return results;
}

// Wait for dependency to be ready
async function waitForService(url: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return true;
    } catch {
      // Service not ready yet
    }
    await sleep(1000);
  }
  return false;
}

// Stagger animations
function animateWithDelay(items: Element[], delayMs = 100) {
  items.forEach((item, index) => {
    setTimeout(() => item.classList.add('visible'), index * delayMs);
  });
}
```

### retry — Resilient API Calls

```typescript
import { retry, exponential, constant, jitter } from '@deessejs/fp';

// Fetch with exponential backoff
async function fetchWithRetry(url: string) {
  const fetchWithBackoff = retry({
    attempts: 3,
    delay: exponential(100), // 100ms, 200ms, 400ms
    onRetry: (err, attempt) => {
      console.warn(`Attempt ${attempt} failed:`, err);
    },
  });

  return fetchWithBackoff(() => fetch(url));
}

// Database connection with linear backoff
async function connectWithRetry(config: DbConfig) {
  return retry({
    attempts: 5,
    delay: constant(500), // 500ms, 500ms, 500ms...
    shouldRetry: (err) => {
      // Don't retry auth errors
      if (err.message.includes('authentication')) return false;
      return true;
    },
  })(() => db.connect(config));
}

// External API with jitter (prevents thundering herd)
async function fetchWithJitter(url: string) {
  return retry({
    attempts: 4,
    delay: (attempt) => exponential(200)(attempt) + jitter(500), // adds 0-500ms
  })(() => fetch(url));
}

// Multiple clients retrying simultaneously
async function fanOutRequests(urls: string[]) {
  // Without jitter: all clients retry at same time
  // With jitter: random delays prevent server overload
  return Promise.all(urls.map(url =>
    retry({
      attempts: 3,
      delay: (attempt) => exponential(100)(attempt) + jitter(200),
    })(() => fetch(url))
  ));
}
```

### jitter — Random Delay for Load Distribution

Adds random variation to prevent thundering herd when multiple clients retry simultaneously.

```typescript
import { jitter, retry, exponential } from '@deessejs/fp';

// Basic jitter (0-500ms)
const delay1 = jitter(500); // 0 to 500ms

// Jitter with minimum
const delay2 = jitter(500, 100); // 100 to 600ms

// Use with retry
const fetchWithJitter = retry({
  attempts: 3,
  delay: (attempt) => exponential(100)(attempt) + jitter(300),
})(() => fetch('/api/data'));
```

### timeout — Preventing Hangs

```typescript
import { timeout } from '@deessejs/fp';

// User-facing API with timeout
async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const result = await timeout(5000, () => api.getUser(userId));
    return result.isOk() ? result.value : null;
  } catch (e) {
    if (e instanceof TimeoutError) {
      console.error('User profile request timed out');
      return null;
    }
    throw e;
  }
}

// Long-running background task
async function processLargeFile(file: File): Promise<ProcessedData> {
  const result = await timeout(60000, () => processFile(file)); // 1 minute max

  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}

// Multiple operations with different timeouts
async function getDashboardData() {
  const [user, posts, notifications] = await Promise.all([
    timeout(2000, () => fetchUser()),
    timeout(5000, () => fetchPosts()),
    timeout(1000, () => fetchNotifications()),
  ]);

  return { user, posts, notifications };
}
```

### queue — Background Job Processing

Works on both client (browser) and server (Node.js).

**Client-side (Browser):**

```typescript
import { queue } from '@deessejs/fp';

// Image upload queue with concurrency limit
const uploadQueue = queue({
  concurrency: 2,
  onError: (err, job) => {
    updateUI({ status: 'failed', error: err.message });
  },
});

async function uploadImages(files: File[]) {
  for (const file of files) {
    uploadQueue.add(async () => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    });
  }

  // Update progress UI
  const updateProgress = () => {
    progressBar.style.width = `${((total - uploadQueue.size) / total) * 100}%`;
  };

  setInterval(updateProgress, 500);
  await uploadQueue.flush();
  showSuccessMessage();
}

// Service worker sync
const syncQueue = queue({ concurrency: 1 });

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncQueue.add(() => syncDataToServer()));
  }
});
```

**Server-side (Node.js):**

```typescript
// Webhook processing
const webhookQueue = queue({
  concurrency: 5,
  onError: (err, job) => {
    console.error('Webhook failed:', err);
    // Re-queue for retry
    setTimeout(() => webhookQueue.add(job), 60000);
  },
});

app.post('/webhook', (req, res) => {
  webhookQueue.add(() => processWebhook(req.body));
  res.status(202).json({ accepted: true }); // Non-blocking
});

// Email sending with priority
const emailQueue = queue({ concurrency: 1 }); // Send one at a time

async function sendEmail(to: string, subject: string, body: string, priority = 0) {
  emailQueue.add(
    () => smtp.send({ to, subject, body }),
    { priority },
  );
}

sendEmail('user@example.com', 'Welcome!', '...', 10); // high priority
sendEmail('marketing@example.com', 'Newsletter', '...', 1); // low priority

// Background job processing (cron-based)
const jobQueue = queue({
  concurrency: 4,
  onError: (err, job) => {
    metrics.increment('job.failed', { type: job.metadata.type });
    deadLetterQueue.add(job);
  },
});

cron.schedule('* * * * *', async () => {
  const pendingJobs = await db.jobs.findPending();
  for (const job of pendingJobs) {
    jobQueue.add(() => processJob(job), { priority: job.priority });
  }
});
```

### AsyncIterator Utilities — Processing Streams

```typescript
import { collect, first, last, mapAsync, filterAsync } from '@deessejs/fp';

// Paginated API - fetch all pages
async function* fetchAllPages<T>(fetchPage: (cursor: number) => Promise<Page<T>>) {
  let cursor = 0;
  while (true) {
    const page = await fetchPage(cursor);
    yield* page.items;
    if (!page.hasMore) break;
    cursor++;
  }
}

// Collect all users
async function getAllUsers(): Promise<User[]> {
  return collect(fetchAllPages(cursor => api.users.list({ cursor })));
}

// Get latest notification
async function getLatestNotification(): Promise<Maybe<Notification>> {
  return last(fetchAllPages(cursor => api.notifications.list({ cursor })));
}

// Process in batches
async function processNotifications(ids: string[]) {
  for await (const batch of chunkIterator(ids, 100)) {
    await Promise.all(batch.map(id => processNotification(id)));
  }
}

// Real-time updates - take first N
async function* subscribeToEvents(endpoint: string) {
  const response = await fetch(endpoint, { headers: { Accept: 'text/event-stream' } });
  const reader = response.body?.getReader();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    yield new TextDecoder().decode(value);
  }
}

async function getFirst3Events(): Promise<string[]> {
  return collect(
    subscribeToEvents('/api/events/stream'),
    { limit: 3 }
  );
}
```

## Combined Patterns

```typescript
import { retry, timeout, queue, exponential } from '@deessejs/fp';

// Robust file upload with retry and timeout
const uploadQueue = queue({ concurrency: 3 });

async function uploadWithRetry(file: File) {
  const robustFetch = retry({
    attempts: 3,
    delay: exponential(200),
  });

  return timeout(30000, () =>
    robustFetch(() => uploadFile(file))
  );
}

uploadQueue.add(() => uploadWithRetry(file));
await uploadQueue.flush();

// Batch processing with backpressure
async function processWithBackpressure(items: Item[]) {
  const processQueue = queue({ concurrency: 4 });

  for (const item of items) {
    processQueue.add(async () => {
      await timeout(5000, () => processItem(item));
    });
  }

  const results = await processQueue.flush();
  const [successes, failures] = partition(results);

  console.log(`Processed: ${successes.length} ok, ${failures.length} failed`);

  return successes;
}
```

## API Reference

### sleep

Promise-based delay.

```typescript
function sleep(ms: number): Promise<void>;
```

### retry

Retries an async operation with configurable policies.

```typescript
function retry<T>(config: RetryConfig): (thunk: () => Promise<T>) => Promise<T>;

interface RetryConfig {
  attempts: number;
  delay: DelayStrategy | ((attempt: number) => number);
  onRetry?: (error: unknown, attempt: number) => void;
  shouldRetry?: (error: unknown) => boolean;
}

type DelayStrategy =
  | typeof exponential(baseMs: number)
  | typeof linear(baseMs: number)
  | typeof constant(baseMs: number);
```

### jitter

Adds random variation to delays. Prevents thundering herd when multiple clients retry at the same time.

```typescript
// Basic jitter: 0 to maxMs
function jitter(maxMs: number): number;

// Jitter with minimum
function jitter(maxMs: number, minMs: number): number;

// Examples
jitter(500);           // 0 to 500ms
jitter(500, 100);       // 100 to 600ms
```

### timeout

Cancels an async operation after a specified duration.

```typescript
function timeout<T>(
  ms: number,
  thunk: () => Promise<T>
): Promise<T>;
// Throws TimeoutError if takes longer than ms
```

### queue

Creates an async job queue with concurrency control.

```typescript
function queue<T>(config?: QueueConfig): Queue<T>;

interface Queue<T> {
  add(job: () => Promise<T>, options?: { priority?: number }): void;
  flush(): Promise<T[]>;
  clear(): void;
  readonly size: number;
}

interface QueueConfig {
  concurrency?: number; // default: 1
  onError?: (error: unknown, job: () => Promise<unknown>) => void;
}
```

### AsyncIterator Utilities

```typescript
// Collect all items from async iterator
async function collect<T>(
  iterable: AsyncIterable<T>,
  options?: { limit?: number }
): Promise<T[]>;

// Get first item
async function first<T>(
  iterable: AsyncIterable<T>
): Promise<Maybe<T>>;

// Get last item
async function last<T>(
  iterable: AsyncIterable<T>
): Promise<Maybe<T>>;

// Transform async iterator
async function mapAsync<T, B>(
  iterable: AsyncIterable<T>,
  fn: (item: T) => B | Promise<B>
): Promise<B[]>;

// Filter async iterator
async function filterAsync<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean | Promise<boolean>
): Promise<T[]>;
```