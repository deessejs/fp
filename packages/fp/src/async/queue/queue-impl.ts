/**
 * QueueImpl — internal implementation of the async job queue.
 *
 * Not exported. The public surface is the `Queue<T>` type alias
 * and the `queue<T>()` factory.
 *
 * Concurrency is capped at `config.concurrency`. Items are
 * executed in insertion order at the same priority; higher
 * priority items jump the queue. Mirrors sindresorhus/p-queue.
 */

interface QueueItem<T> {
  readonly thunk: () => Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (error: unknown) => void;
  readonly priority: number;
}

export interface AddOptions {
  readonly priority?: number;
}

export class QueueImpl<T> {
  readonly #concurrency: number;
  readonly #pending: QueueItem<T>[] = [];
  #running = 0;

  constructor(concurrency: number) {
    this.#concurrency = concurrency;
  }

  add(thunk: () => Promise<T>, options?: AddOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem<T> = {
        thunk,
        resolve,
        reject,
        priority: options?.priority ?? 0,
      };
      if (this.#running < this.#concurrency) {
        this.#running++;
        this.#runItem(item);
      } else {
        this.#pending.push(item);
        this.#sortPending();
      }
    });
  }

  #sortPending(): void {
    this.#pending.sort((a, b) => b.priority - a.priority);
  }

  #runItem(item: QueueItem<T>): void {
    item.thunk().then(
      (value) => {
        item.resolve(value);
        this.#running--;
        this.#drain();
      },
      (error) => {
        item.reject(error);
        this.#running--;
        this.#drain();
      },
    );
  }

  #drain(): void {
    while (this.#running < this.#concurrency && this.#pending.length > 0) {
      const item = this.#pending.shift()!;
      this.#running++;
      this.#runItem(item);
    }
  }

  flush(): Promise<void> {
    return new Promise<void>((resolve) => {
      const tick = (): void => {
        if (this.#pending.length === 0 && this.#running === 0) {
          resolve();
          return;
        }
        const g = globalThis as { setImmediate?: (cb: () => void) => void };
        if (g.setImmediate) g.setImmediate(tick);
        else setTimeout(tick, 0);
      };
      tick();
    });
  }

  get size(): number {
    return this.#pending.length;
  }

  get pending(): number {
    return this.#running;
  }
}