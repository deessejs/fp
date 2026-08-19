import { describe, it, expect, vi } from 'vitest';
import { sleep } from '@deessejs/fp';

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    vi.useFakeTimers();
    const p = sleep(100);
    vi.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('does not resolve before the delay', async () => {
    vi.useFakeTimers();
    let resolved = false;
    const p = sleep(100).then(() => {
      resolved = true;
    });
    vi.advanceTimersByTime(50);
    await Promise.resolve();
    expect(resolved).toBe(false);
    vi.advanceTimersByTime(50);
    await p;
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });

  it('rejects immediately when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(sleep(100, { signal: controller.signal })).rejects.toThrow();
  });

  it('rejects when the signal aborts during the wait', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const p = sleep(1000, { signal: controller.signal });
    vi.advanceTimersByTime(500);
    controller.abort();
    await expect(p).rejects.toThrow();
    vi.useRealTimers();
  });

  it('propagates the abort reason when provided', async () => {
    const controller = new AbortController();
    controller.abort(new Error('custom reason'));
    await expect(sleep(100, { signal: controller.signal })).rejects.toThrow('custom reason');
  });

  it('uses DOMException with AbortError name when no reason is provided', async () => {
    const controller = new AbortController();
    controller.abort();
    try {
      await sleep(100, { signal: controller.signal });
      expect.unreachable('should have thrown');
    } catch (e) {
      expect((e as { name: string }).name).toBe('AbortError');
    }
  });
});