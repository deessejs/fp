import { describe, it, expect, vi } from 'vitest';
import { timeout, TimeoutError } from '@deessejs/fp';

describe('TimeoutError', () => {
  it('has the expected name', () => {
    expect(new TimeoutError().name).toBe('TimeoutError');
  });

  it('accepts a custom message', () => {
    expect(new TimeoutError('custom').message).toBe('custom');
  });

  it('is an Error', () => {
    expect(new TimeoutError()).toBeInstanceOf(Error);
  });

  it('defaults the message when no argument is supplied', () => {
    expect(new TimeoutError().message).toBe('Operation timed out');
  });
});

describe('timeout', () => {
  it('resolves with the inner value when faster than ms', async () => {
    const value = await timeout(100, () => Promise.resolve('hello'));
    expect(value).toBe('hello');
  });

  it('rejects with TimeoutError when slower than ms', async () => {
    vi.useFakeTimers();
    const never = new Promise<string>(() => {});
    const p = timeout(50, () => never);
    p.catch(() => {});
    await vi.advanceTimersByTimeAsync(50);
    await expect(p).rejects.toBeInstanceOf(TimeoutError);
    vi.useRealTimers();
  });

  it('propagates the inner error when the thunk rejects before timeout', async () => {
    const err = new Error('inner');
    await expect(timeout(100, () => Promise.reject(err))).rejects.toBe(err);
  });

  it('ignores late settlements from the inner thunk', async () => {
    vi.useFakeTimers();
    let settled = false;
    const inner = timeout(50, () =>
      new Promise<string>((resolve) => {
        setTimeout(() => {
          settled = true;
          resolve('late');
        }, 500);
      }),
    );
    inner.catch(() => {});
    await vi.advanceTimersByTimeAsync(50);
    await expect(inner).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(500);
    expect(settled).toBe(true);
    vi.useRealTimers();
  });

  it('resolves cleanly when the inner thunk completes before ms elapses', async () => {
    const value = await timeout(1000, () => Promise.resolve(42));
    expect(value).toBe(42);
  });

  it('handles synchronous-throwing thunks', async () => {
    await expect(
      timeout(100, () => Promise.reject(new Error('sync boom'))),
    ).rejects.toThrow('sync boom');
  });
});