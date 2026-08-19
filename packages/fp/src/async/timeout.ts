/**
 * timeout — bound an async thunk by a wall-clock duration.
 *
 * `timeout(ms, fn)` rejects with `TimeoutError` if `fn` does not
 * settle within `ms` milliseconds. The inner thunk keeps running;
 * its eventual settlement is dropped to keep the contract simple.
 *
 * For cancellation, prefer `AbortSignal.timeout(ms)` combined with
 * a thunk that supports an AbortSignal (e.g. `fetch(url, { signal })`).
 *
 * @see TimeoutError
 */
import { TimeoutError } from './timeout-error.js';

export function timeout<T>(ms: number, thunk: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new TimeoutError());
    }, ms);
    thunk().then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}