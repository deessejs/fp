import { describe, it, expect, vi } from 'vitest';
import { queue } from '@deessejs/fp';

describe('queue', () => {
  it('runs jobs serially by default (concurrency 1)', async () => {
    vi.useFakeTimers();
    const order: number[] = [];
    const q = queue();
    const promises = [
      q.add(async () => {
        order.push(1);
        await new Promise((r) => setTimeout(r, 20));
        order.push(2);
        return 'a';
      }),
      q.add(async () => {
        order.push(3);
        await new Promise((r) => setTimeout(r, 10));
        order.push(4);
        return 'b';
      }),
      q.add(async () => {
        order.push(5);
        return 'c';
      }),
    ];
    await vi.runAllTimersAsync();
    await Promise.all(promises);
    expect(order).toEqual([1, 2, 3, 4, 5]);
    vi.useRealTimers();
  });

  it('respects concurrency limit', async () => {
    vi.useFakeTimers();
    let running = 0;
    let maxRunning = 0;
    const q = queue({ concurrency: 2 });
    const tasks = Array.from({ length: 6 }, (_, i) =>
      q.add(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((r) => setTimeout(r, 10));
        running--;
        return i;
      }),
    );
    await vi.runAllTimersAsync();
    await Promise.all(tasks);
    expect(maxRunning).toBeLessThanOrEqual(2);
    vi.useRealTimers();
  });

  it('resolves each add with its thunk value', async () => {
    const q = queue();
    const results = await Promise.all([
      q.add(async () => 1),
      q.add(async () => 2),
      q.add(async () => 3),
    ]);
    expect(results).toEqual([1, 2, 3]);
  });

  it('rejects add when its thunk rejects', async () => {
    const q = queue();
    await expect(q.add(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
  });

  it('exposes size and pending', async () => {
    vi.useFakeTimers();
    const q = queue({ concurrency: 1 });
    expect(q.size).toBe(0);
    expect(q.pending).toBe(0);
    const p1 = q.add(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return 'a';
    });
    const p2 = q.add(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return 'b';
    });
    expect(q.size + q.pending).toBeGreaterThan(0);
    await vi.runAllTimersAsync();
    await Promise.all([p1, p2]);
    expect(q.size).toBe(0);
    expect(q.pending).toBe(0);
    vi.useRealTimers();
  });

  it('orders higher priority items first', async () => {
    const order: string[] = [];
    const q = queue({ concurrency: 1 });
    const firstP = q.add(() => {
      order.push('first');
      return Promise.resolve('first');
    });
    const lowP = q.add(() => {
      order.push('low');
      return Promise.resolve('low');
    });
    const highP = q.add(() => {
      order.push('high');
      return Promise.resolve('high');
    }, { priority: 10 });
    await Promise.all([firstP, lowP, highP]);
    expect(order[0]).toBe('first');
    expect(order[1]).toBe('high');
    expect(order[2]).toBe('low');
  });

  it('flush waits until all jobs settle', async () => {
    vi.useFakeTimers();
    const q = queue();
    const items: number[] = [];
    q.add(async () => {
      await new Promise((r) => setTimeout(r, 10));
      items.push(1);
    });
    q.add(async () => {
      await new Promise((r) => setTimeout(r, 20));
      items.push(2);
    });
    q.add(async () => {
      await new Promise((r) => setTimeout(r, 5));
      items.push(3);
    });
    const flushP = q.flush();
    flushP.catch(() => {});
    await vi.runAllTimersAsync();
    await flushP;
    expect(items).toEqual([1, 2, 3]);
    expect(q.size).toBe(0);
    expect(q.pending).toBe(0);
    vi.useRealTimers();
  });

  it('flush resolves immediately when the queue is empty', async () => {
    const q = queue();
    await q.flush();
    expect(q.size).toBe(0);
    expect(q.pending).toBe(0);
  });

  it('flush waits for rejections too', async () => {
    vi.useFakeTimers();
    const q = queue();
    q.add(() => Promise.reject(new Error('x'))).catch(() => {});
    q.add(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    const flushP = q.flush();
    flushP.catch(() => {});
    await vi.runAllTimersAsync();
    await flushP;
    expect(q.size).toBe(0);
    expect(q.pending).toBe(0);
    vi.useRealTimers();
  });

  it('default concurrency is 1', async () => {
    vi.useFakeTimers();
    let running = 0;
    let maxRunning = 0;
    const q = queue();
    const tasks = Array.from({ length: 4 }, (_, i) =>
      q.add(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((r) => setTimeout(r, 5));
        running--;
        return i;
      }),
    );
    await vi.runAllTimersAsync();
    await Promise.all(tasks);
    expect(maxRunning).toBe(1);
    vi.useRealTimers();
  });

  it('drains via setImmediate', async () => {
    vi.useFakeTimers();
    const q = queue();
    const p = q.add(async () => 42);
    p.catch(() => {});
    await vi.runAllTimersAsync();
    await expect(p).resolves.toBe(42);
    vi.useRealTimers();
  });
});