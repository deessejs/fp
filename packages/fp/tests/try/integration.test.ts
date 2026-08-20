import { describe, it, expect } from 'vitest';
import { pipe } from '@deessejs/fp';
import {
  tryPromise,
  matchTry,
  toResultTry,
  mapTry,
  isSuccess,
  isFailure,
  success,
  failure,
} from '@deessejs/fp';
import { map as mapResult, getOrElse as getOrElseResult } from '@deessejs/fp';

describe('Try integration', () => {
  it('tryPromise -> matchTry returns the success value', async () => {
    const t = await tryPromise(() => Promise.resolve(10));
    const out = pipe(
      t,
      matchTry({
        success: (v) => `success:${v}`,
        failure: () => 'failure',
      }),
    );
    expect(out).toBe('success:10');
  });

  it('tryPromise -> matchTry returns the failure cause', async () => {
    const t = await tryPromise<number, string>({
      onSuccess: () => Promise.resolve(10),
      onError: () => 'mapped-error',
    });
    // flip the success path to a failure
    const t2 = await tryPromise<number, string>({
      onSuccess: () => Promise.reject(new Error('boom')),
      onError: () => 'mapped-error',
    });
    expect(pipe(t, matchTry({ success: () => 's', failure: () => 'f' }))).toBe('s');
    expect(pipe(t2, matchTry({ success: () => 's', failure: (e) => e }))).toBe('mapped-error');
  });

  it('toResultTry -> map (Result pipeable) composes across modules', async () => {
    const t = await tryPromise(() => Promise.resolve(10));
    const r = pipe(t, toResultTry(), mapResult((x: number) => x * 2));
    expect(r.isOk()).toBe(true);
    if (r.isOk()) expect(r.value).toBe(20);
  });

  it('toResultTry -> getOrElseResult falls back on Failure', async () => {
    const t = await tryPromise<number, string>({
      onSuccess: () => Promise.reject(new Error('boom')),
      onError: () => 'err',
    });
    const out = pipe(t, toResultTry(), getOrElseResult(99));
    expect(out).toBe(99);
  });

  it('mapTry on Failure passes through', () => {
    const out = pipe(
      failure<number, string>('e'),
      mapTry((x) => x * 2),
      mapTry((x) => x + 1),
    );
    expect(out.isFailure()).toBe(true);
  });

  it('isSuccess narrows Try from tryPromise', async () => {
    const t = await tryPromise(() => Promise.resolve(7));
    if (isSuccess(t)) {
      expect(t.value).toBe(7);
    } else {
      throw new Error('expected Success');
    }
  });

  it('isFailure narrows Try from tryPromise with options', async () => {
    const t = await tryPromise<number, string>({
      onSuccess: () => Promise.reject(new Error('boom')),
      onError: (e) => (e instanceof Error ? e.message : 'unknown'),
    });
    if (isFailure(t)) {
      expect(t.cause).toBe('boom');
    } else {
      throw new Error('expected Failure');
    }
  });

  // smoke
  it('imports success and failure', () => {
    expect(success(1).isSuccess()).toBe(true);
    expect(failure('e').isFailure()).toBe(true);
  });
});
