import { describe, it, expect } from 'vitest';
import { pipe } from '@deessejs/fp';
import {
  fromThrowable,
  fromAsyncThrowable,
  map,
  getOrElse,
  isOk,
  isErr,
  ok,
  err,
} from '@deessejs/fp';

describe('Result wrapping integration', () => {
  it('fromThrowable -> pipe -> Result pipeables', () => {
    const out = pipe(
      fromThrowable<number>(() => 10),
      map((n) => n * 2),
      getOrElse(0),
    );
    expect(out).toBe(20);
  });

  it('fromAsyncThrowable -> map -> getOrElse', async () => {
    const r = await fromAsyncThrowable<number>(() => Promise.resolve(10));
    const out = pipe(r, map((n) => n * 2), getOrElse(0));
    expect(out).toBe(20);
  });

  it('isOk narrows a fromThrowable result', () => {
    const r = fromThrowable<number>(() => 7);
    if (isOk(r)) {
      expect(r.value).toBe(7);
    } else {
      throw new Error('expected Ok');
    }
  });

  it('isErr narrows a throwing fromThrowable result', () => {
    const r = fromThrowable<number>(() => {
      throw new Error('boom');
    });
    if (isErr(r)) {
      expect(r.error._tag).toBe('UnhandledException');
    } else {
      throw new Error('expected Err');
    }
  });

  it('ok / err factories still work', () => {
    expect(ok(1).isOk()).toBe(true);
    expect(err('e').isErr()).toBe(true);
  });
});
