import { describe, it, expect, vi } from 'vitest';
import { retry, exponential, linear, constantDelay, jitter, sleep } from '@deessejs/fp';

describe('exponential strategy', () => {
  it('grows by factor', () => {
    const s = exponential({ baseMs: 100, factor: 2 });
    expect(s(1)).toBe(100);
    expect(s(2)).toBe(200);
    expect(s(3)).toBe(400);
  });

  it('caps at maxMs', () => {
    const s = exponential({ baseMs: 100, factor: 2, maxMs: 250 });
    expect(s(3)).toBe(250);
    expect(s(4)).toBe(250);
  });

  it('uses factor 2 by default', () => {
    const s = exponential({ baseMs: 50 });
    expect(s(1)).toBe(50);
    expect(s(2)).toBe(100);
  });
});

describe('linear strategy', () => {
  it('adds stepMs each attempt', () => {
    const s = linear({ stepMs: 100 });
    expect(s(1)).toBe(100);
    expect(s(2)).toBe(200);
    expect(s(3)).toBe(300);
  });

  it('caps at maxMs', () => {
    const s = linear({ stepMs: 100, maxMs: 250 });
    expect(s(3)).toBe(250);
  });
});

describe('constantDelay strategy', () => {
  it('returns the same delay each time', () => {
    const s = constantDelay({ delayMs: 200 });
    expect(s(1)).toBe(200);
    expect(s(2)).toBe(200);
    expect(s(99)).toBe(200);
  });
});

describe('jitter', () => {
  it('adds a random offset between 0 and base * amplitude', () => {
    const base: (_a: number) => number = () => 100;
    const j = jitter(base, { amplitude: 0.5 });
    const result = j(1);
    expect(result).toBeGreaterThanOrEqual(100);
    expect(result).toBeLessThanOrEqual(150);
  });

  it('uses amplitude 0.5 by default', () => {
    const base: (_a: number) => number = () => 100;
    const j = jitter(base);
    const result = j(1);
    expect(result).toBeGreaterThanOrEqual(100);
    expect(result).toBeLessThanOrEqual(150);
  });

  it('amplitude 0 means no jitter', () => {
    const base: (_a: number) => number = () => 100;
    const j = jitter(base, { amplitude: 0 });
    expect(j(1)).toBe(100);
  });
});

describe('retry', () => {
  it('returns the value on first success', async () => {
    const fn = vi.fn(() => Promise.resolve('ok'));
    const result = await retry({}, fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries until success', async () => {
    let calls = 0;
    const fn = (): Promise<string> => {
      calls++;
      if (calls < 3) return Promise.reject(new Error('fail'));
      return Promise.resolve('done');
    };
    const result = await retry({ maxAttempts: 5, strategy: constantDelay({ delayMs: 0 }) }, fn);
    expect(result).toBe('done');
    expect(calls).toBe(3);
  });

  it('throws after maxAttempts', async () => {
    const fn = (): Promise<never> => Promise.reject(new Error('always fails'));
    await expect(retry({ maxAttempts: 3, strategy: constantDelay({ delayMs: 0 }) }, fn)).rejects.toThrow(
      'always fails',
    );
  });

  it('skips retry when shouldRetry returns false', async () => {
    let calls = 0;
    const fn = (): Promise<never> => {
      calls++;
      return Promise.reject(new Error('fail'));
    };
    await expect(
      retry(
        {
          maxAttempts: 5,
          shouldRetry: () => false,
          strategy: constantDelay({ delayMs: 0 }),
        },
        fn,
      ),
    ).rejects.toThrow('fail');
    expect(calls).toBe(1);
  });

  it('invokes onRetry on each retry', async () => {
    const onRetry = vi.fn();
    let calls = 0;
    const fn = (): Promise<string> => {
      calls++;
      if (calls < 2) return Promise.reject(new Error('first'));
      return Promise.resolve('ok');
    };
    await retry({ strategy: constantDelay({ delayMs: 0 }), onRetry }, fn);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  it('uses maxAttempts=5 by default', async () => {
    let calls = 0;
    const fn = (): Promise<never> => {
      calls++;
      return Promise.reject(new Error('x'));
    };
    await expect(retry({ strategy: constantDelay({ delayMs: 0 }) }, fn)).rejects.toThrow('x');
    expect(calls).toBe(5);
  });

  it('no delay when strategy is not provided', async () => {
    const fn = vi.fn(() => Promise.reject(new Error('x')));
    await expect(retry({ maxAttempts: 2 }, fn)).rejects.toThrow('x');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('waits for the strategy delay between attempts', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const fn = (): Promise<string> => {
      calls++;
      if (calls < 2) return Promise.reject(new Error('fail'));
      return Promise.resolve('ok');
    };
    const p = retry(
      { maxAttempts: 3, strategy: constantDelay({ delayMs: 100 }) },
      fn,
    );
    p.catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    await p;
    expect(calls).toBe(2);
    vi.useRealTimers();
  });

  it('throws AbortError when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn(() => Promise.resolve('x'));
    await expect(retry({ signal: controller.signal }, fn)).rejects.toMatchObject({ name: 'AbortError' });
    expect(fn).not.toHaveBeenCalled();
  });

  it('aborts a sleep during a retry when the signal aborts', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const fn = vi.fn(() => Promise.reject(new Error('fail')));
    const p = retry(
      {
        maxAttempts: 3,
        strategy: constantDelay({ delayMs: 100 }),
        signal: controller.signal,
      },
      fn,
    );
    p.catch(() => {});
    await vi.advanceTimersByTimeAsync(50);
    controller.abort();
    await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    vi.useRealTimers();
  });

  it('passes attempt number to shouldRetry', async () => {
    const fn = (): Promise<never> => Promise.reject(new Error('x'));
    const shouldRetry = vi.fn(() => false);
    await expect(
      retry({ maxAttempts: 5, shouldRetry, strategy: constantDelay({ delayMs: 0 }) }, fn),
    ).rejects.toThrow();
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });
});