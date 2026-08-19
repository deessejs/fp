/**
 * Queue — public module exports.
 *
 * Public surface: types and factory. The internal `QueueImpl` class
 * is not re-exported (rule 0014 — class is a detail of internal
 * implementation).
 */

import { QueueImpl, type AddOptions } from './queue-impl.js';

export type { AddOptions };

export interface QueueConfig {
  /** Maximum concurrent jobs. Default 1. */
  readonly concurrency?: number;
}

export interface Queue<T> {
  add(thunk: () => Promise<T>, options?: AddOptions): Promise<T>;
  flush(): Promise<void>;
  readonly size: number;
  readonly pending: number;
}

export function queue<T>(config?: QueueConfig): Queue<T> {
  const impl = new QueueImpl<T>(config?.concurrency ?? 1);
  return {
    add: (thunk, options) => impl.add(thunk, options),
    flush: () => impl.flush(),
    get size(): number {
      return impl.size;
    },
    get pending(): number {
      return impl.pending;
    },
  };
}