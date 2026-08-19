/**
 * sleep — delay a promise for `ms` milliseconds.
 *
 * If `signal` is supplied and aborts during the wait, the returned
 * promise rejects with the signal's reason (or a `DOMException`
 * named `'AbortError'` when no reason is set).
 */
export interface SleepOptions {
  readonly signal?: AbortSignal;
}

export function sleep(ms: number, options?: SleepOptions): Promise<void> {
  const signal = options?.signal;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      resolve();
    }, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    }
  });
}