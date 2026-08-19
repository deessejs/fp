/**
 * Async utilities — public module exports.
 */

export { sleep, type SleepOptions } from './sleep.js';
export { timeout } from './timeout.js';
export { TimeoutError } from './timeout-error.js';
export { retry, type RetryConfig } from './retry.js';

export {
  exponential,
  linear,
  constantDelay,
  jitter,
  type ExponentialOptions,
  type LinearOptions,
  type ConstantDelayOptions,
  type JitterOptions,
} from './retry/index.js';

export { queue, type Queue, type QueueConfig, type AddOptions } from './queue/index.js';