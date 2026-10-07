import { describe, it, expect } from 'vitest';
import { pending, done, failed, poll } from '@deessejs/fp';
import type { Poll } from '@deessejs/fp';

type State = { count: number };

describe('poll', () => {
  it('returns Ok with the final value on first-call success', async () => {
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => done({ count: state.count + 1 }),
      interval: 0,
    });
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 1 });
    }
  });

  it('returns Err when the handler fails on the first call', async () => {
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async () => failed('nope'),
      interval: 0,
    });
    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error).toBe('nope');
    }
  });

  it('loops on pending and eventually succeeds', async () => {
    let calls = 0;
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => {
        calls += 1;
        if (calls < 3) {
          return pending({ count: state.count + 1 });
        }
        return done({ count: state.count + 1 });
      },
      interval: 0,
    });
    expect(calls).toBe(3);
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 3 });
    }
  });

  it('returns the most recent pending state when the handler eventually fails', async () => {
    const calls: number[] = [];
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => {
        calls.push(state.count);
        if (state.count < 2) {
          return pending({ count: state.count + 1 });
        }
        return failed('gave up');
      },
      interval: 0,
    });
    expect(calls).toEqual([0, 1, 2]);
    expect(result._tag).toBe('Err');
  });

  it('stops at maxAttempts and returns Err from the exhausted factory', async () => {
    let calls = 0;
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => {
        calls += 1;
        return pending({ count: state.count + 1 });
      },
      interval: 0,
      maxAttempts: 3,
      exhausted: (state, attempts) => `exhausted after ${attempts} (count=${state.count})`,
    });
    expect(calls).toBe(3);
    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error).toBe('exhausted after 3 (count=3)');
    }
  });

  it('throws synchronously when maxAttempts is set but exhausted is missing', async () => {
    await expect(
      poll<State, string>({
        initial: { count: 0 },
        handler: async () => pending({ count: 1 }),
        interval: 0,
        // @ts-expect-error -- intentionally omitting exhausted to test the guard
        maxAttempts: 1,
      })
    ).rejects.toThrow(/exhausted/);
  });

  it('applies backoff after each pending and feeds the new interval to the next sleep', async () => {
    const backoffCalls: number[] = [];
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => {
        if (state.count < 2) {
          return pending({ count: state.count + 1 });
        }
        return done({ count: state.count });
      },
      interval: 100,
      backoff: (state) => {
        backoffCalls.push(state.count);
        return state.count * 1000 + 2000;
      },
      maxAttempts: 3,
      exhausted: () => 'exhausted',
    });

    // The handler runs 3 times: at count=0 (pending -> count=1), at count=1 (pending -> count=2), at count=2 (done).
    // Backoff is called after each pending: once with state.count=1, once with state.count=2.
    expect(backoffCalls).toEqual([1, 2]);
    expect(result._tag).toBe('Ok');
  });

  it('returns Ok(state) when until is satisfied, even if handler would have pending', async () => {
    let calls = 0;
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => {
        calls += 1;
        return pending({ count: state.count + 1 });
      },
      interval: 0,
      maxAttempts: 100,
      exhausted: () => 'exhausted',
      until: (state) => state.count >= 2,
    });
    // Trace:
    //   call 1: state.count=0, returns pending({count:1}), until(1)=false, sleep
    //   call 2: state.count=1, returns pending({count:2}), until(2)=true, return ok({count:2})
    expect(calls).toBe(2);
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 2 });
    }
  });

  it('propagates exceptions thrown by handler', async () => {
    await expect(
      poll<State, string>({
        initial: { count: 0 },
        handler: async () => {
          throw new Error('boom');
        },
        interval: 0,
      })
    ).rejects.toThrow('boom');
  });

  it('handles a handler that returns done with a different value than the input state', async () => {
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async () => done({ count: 99, extra: 'hello' } as unknown as State),
      interval: 0,
    });
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 99, extra: 'hello' });
    }
  });

  it('produces exhaust error using the *final* state, not the initial one', async () => {
    const result = await poll<State, string>({
      initial: { count: 0 },
      handler: async (state) => pending({ count: state.count + 5 }),
      interval: 0,
      maxAttempts: 2,
      exhausted: (state, attempts) => `final=${state.count} attempts=${attempts}`,
    });
    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error).toBe('final=10 attempts=2');
    }
  });
});
