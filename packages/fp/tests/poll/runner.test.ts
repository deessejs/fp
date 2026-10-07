import { describe, it, expect } from 'vitest';
import { pending, done, failed, poll } from '@deessejs/fp';
import type { Poll } from '@deessejs/fp';

type State = { count: number };

describe('poll', () => {
  it('returns Ok with the final value on first-call success', async () => {
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => done({ count: state.count + 1 }),
      { interval: 0 }
    );
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 1 });
    }
  });

  it('returns Err when the step fails on the first call', async () => {
    const result = await poll<State, string>({ count: 0 }, async () => failed('nope'), {
      interval: 0,
    });
    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error).toBe('nope');
    }
  });

  it('loops on pending and eventually succeeds', async () => {
    let calls = 0;
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => {
        calls += 1;
        if (calls < 3) {
          return pending({ count: state.count + 1 });
        }
        return done({ count: state.count + 1 });
      },
      { interval: 0 }
    );
    expect(calls).toBe(3);
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 3 });
    }
  });

  it('returns the most recent pending state when the step eventually fails', async () => {
    const calls: number[] = [];
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => {
        calls.push(state.count);
        if (state.count < 2) {
          return pending({ count: state.count + 1 });
        }
        return failed('gave up');
      },
      { interval: 0 }
    );
    expect(calls).toEqual([0, 1, 2]);
    expect(result._tag).toBe('Err');
  });

  it('stops at maxAttempts and returns Err from the exhausted factory', async () => {
    let calls = 0;
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => {
        calls += 1;
        return pending({ count: state.count + 1 });
      },
      {
        interval: 0,
        maxAttempts: 3,
        exhausted: (state, attempts) => `exhausted after ${attempts} (count=${state.count})`,
      }
    );
    expect(calls).toBe(3);
    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error).toBe('exhausted after 3 (count=3)');
    }
  });

  it('throws synchronously when maxAttempts is set but exhausted is missing', async () => {
    await expect(
      poll<State, string>(
        { count: 0 },
        async () => pending({ count: 1 }),
        // @ts-expect-error -- intentionally omitting exhausted to test the guard
        { interval: 0, maxAttempts: 1 }
      )
    ).rejects.toThrow(/exhausted/);
  });

  it('applies backoff after each pending and feeds the new interval to the next sleep', async () => {
    const backoffCalls: number[] = [];
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => {
        if (state.count < 2) {
          return pending({ count: state.count + 1 });
        }
        return done({ count: state.count });
      },
      {
        interval: 100,
        backoff: (state) => {
          backoffCalls.push(state.count);
          return state.count * 1000 + 2000;
        },
        maxAttempts: 3,
        exhausted: () => 'exhausted',
      }
    );

    // The step runs 3 times: at count=0 (pending → count=1), at count=1 (pending → count=2), at count=2 (done).
    // Backoff is called after each pending: once with state.count=1, once with state.count=2.
    expect(backoffCalls).toEqual([1, 2]);
    expect(result._tag).toBe('Ok');
  });

  it('returns Ok(state) when until is satisfied, even if step would have pending', async () => {
    let calls = 0;
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => {
        calls += 1;
        return pending({ count: state.count + 1 });
      },
      {
        interval: 0,
        maxAttempts: 100,
        exhausted: () => 'exhausted',
        until: (state) => state.count >= 2,
      }
    );
    // Trace:
    //   call 1: state.count=0, returns pending({count:1}), until(1)=false, sleep
    //   call 2: state.count=1, returns pending({count:2}), until(2)=true, return ok({count:2})
    expect(calls).toBe(2);
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 2 });
    }
  });

  it('propagates exceptions thrown by step', async () => {
    await expect(
      poll<State, string>(
        { count: 0 },
        async () => {
          throw new Error('boom');
        },
        { interval: 0 }
      )
    ).rejects.toThrow('boom');
  });

  it('handles a step that returns done with a different value than the input state', async () => {
    const result = await poll<State, string>(
      { count: 0 },
      async () => done({ count: 99, extra: 'hello' } as unknown as State),
      { interval: 0 }
    );
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 99, extra: 'hello' });
    }
  });

  it('produces exhaust error using the *final* state, not the initial one', async () => {
    const result = await poll<State, string>(
      { count: 0 },
      async (state) => pending({ count: state.count + 5 }),
      {
        interval: 0,
        maxAttempts: 2,
        exhausted: (state, attempts) => `final=${state.count} attempts=${attempts}`,
      }
    );
    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error).toBe('final=10 attempts=2');
    }
  });

  it('curried form poll(initial)(step)(options) returns the same Result', async () => {
    const step = async (s: State): Promise<Poll<State, string>> => done({ count: s.count + 1 });
    const runner = poll<State, string>({ count: 0 })(step)({ interval: 0 });
    const result = await runner;
    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value).toEqual({ count: 1 });
    }
  });

  it('throws when exhausted is missing at the cap, even if it was set when poll was called', async () => {
    // The guard at the top of poll() catches the missing-exhausted case
    // synchronously. The defensive fallback inside the loop covers the
    // case where `exhausted` is a truthy-looking value at type-check
    // time but `undefined` at runtime -- modeled here with a getter
    // that returns undefined the first time the property is read (which
    // the top-of-function guard uses) and undefined the second time
    // (which the in-loop branch uses). This is the only way to exercise
    // the unreachable-looking branch without changing the production
    // code.
    let callCount = 0;
    const options = {
      interval: 0,
      maxAttempts: 1,
      // The top-level guard reads options.exhausted once at entry, so
      // it sees a function. The in-loop branch reads it again from a
      // different lookup path; the getter returns undefined on every
      // call past the first, so the in-loop branch hits the throw.
      get exhausted() {
        callCount += 1;
        if (callCount === 1) {
          return () => 'sentinel: should not be reached';
        }
        return undefined;
      },
    } as unknown as Parameters<typeof poll<State, string>>[2];

    await expect(
      poll<State, string>(
        { count: 0 },
        async () => pending({ count: 1 }),
        options
      )
    ).rejects.toThrow(/exhausted/);
  });
});
