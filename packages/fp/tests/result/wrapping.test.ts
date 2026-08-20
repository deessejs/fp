import { describe, it, expect } from 'vitest';
import {
  ok,
  err,
  isOk,
  isErr,
  fromThrowable,
  fromAsyncThrowable,
} from '@deessejs/fp';

describe('fromThrowable', () => {
  describe('thunk overload', () => {
    it('returns Ok when the thunk returns', () => {
      const r = fromThrowable<number>(() => 10);
      expect(r.isOk()).toBe(true);
      if (r.isOk()) expect(r.value).toBe(10);
    });

    it('returns Err(UnhandledException) when the thunk throws an Error', () => {
      const r = fromThrowable<number>(() => {
        throw new Error('boom');
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) {
        expect(r.error._tag).toBe('UnhandledException');
        expect((r.error.cause as Error).message).toBe('boom');
      }
    });

    it('captures non-Error throws as-is', () => {
      const r = fromThrowable<number>(() => {
        throw 'string-throw';
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) {
        expect(r.error.cause).toBe('string-throw');
      }
    });
  });

  describe('options overload', () => {
    it('returns Ok when onSuccess returns', () => {
      const r = fromThrowable<number, string>({
        onSuccess: () => 10,
        onError: () => 'e',
      });
      expect(r.isOk()).toBe(true);
      if (r.isOk()) expect(r.value).toBe(10);
    });

    it('returns Err mapped via onError when onSuccess throws', () => {
      const r = fromThrowable<number, string>({
        onSuccess: () => {
          throw new Error('boom');
        },
        onError: (cause) => 'mapped:' + (cause as Error).message,
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('mapped:boom');
    });

    it('captures non-Error throws and maps them through onError', () => {
      const r = fromThrowable<number, string>({
        onSuccess: () => {
          throw 42;
        },
        onError: (cause) => 'got:' + cause,
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('got:42');
    });
  });

  describe('pipeability', () => {
    it('Result pipeables work on fromThrowable output', () => {
      const r = fromThrowable<number>(() => 10);
      const mapped = r.map((x) => x * 2);
      expect(mapped.isOk()).toBe(true);
      if (mapped.isOk()) expect(mapped.value).toBe(20);
    });

    it('Result match works on fromThrowable output', () => {
      const r = fromThrowable<number>(() => 10);
      const out = r.match({
        ok: (v) => 'ok:' + v,
        err: () => 'err',
      });
      expect(out).toBe('ok:10');
    });
  });
});

describe('fromAsyncThrowable', () => {
  describe('thunk overload', () => {
    it('returns Ok when the promise resolves', async () => {
      const r = await fromAsyncThrowable<number>(() => Promise.resolve(10));
      expect(r.isOk()).toBe(true);
      if (r.isOk()) expect(r.value).toBe(10);
    });

    it('returns Err(UnhandledException) when the promise rejects with an Error', async () => {
      const r = await fromAsyncThrowable<number>(() => Promise.reject(new Error('boom')));
      expect(r.isErr()).toBe(true);
      if (r.isErr()) {
        expect(r.error._tag).toBe('UnhandledException');
        expect((r.error.cause as Error).message).toBe('boom');
      }
    });

    it('returns Err when the thunk throws synchronously', async () => {
      const r = await fromAsyncThrowable<number>(() => {
        throw new Error('sync-throw');
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) {
        expect((r.error.cause as Error).message).toBe('sync-throw');
      }
    });

    it('captures non-Error rejections as-is', async () => {
      const r = await fromAsyncThrowable<number>(() => Promise.reject('string-reject'));
      expect(r.isErr()).toBe(true);
      if (r.isErr()) {
        expect(r.error.cause).toBe('string-reject');
      }
    });
  });

  describe('options overload', () => {
    it('returns Ok when onSuccess resolves', async () => {
      const r = await fromAsyncThrowable<number, string>({
        onSuccess: () => Promise.resolve(10),
        onError: () => 'e',
      });
      expect(r.isOk()).toBe(true);
      if (r.isOk()) expect(r.value).toBe(10);
    });

    it('returns Err mapped via onError when onSuccess rejects', async () => {
      const r = await fromAsyncThrowable<number, string>({
        onSuccess: () => Promise.reject(new Error('boom')),
        onError: (cause) => 'mapped:' + (cause as Error).message,
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('mapped:boom');
    });

    it('returns Err mapped via async onError', async () => {
      const r = await fromAsyncThrowable<number, string>({
        onSuccess: () => Promise.reject(new Error('boom')),
        onError: async (cause) => 'async:' + (cause as Error).message,
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('async:boom');
    });

    it('maps synchronous throws from onSuccess through onError', async () => {
      const r = await fromAsyncThrowable<number, string>({
        onSuccess: () => {
          throw new Error('sync');
        },
        onError: (cause) => 'caught:' + (cause as Error).message,
      });
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('caught:sync');
    });
  });

  describe('pipeability', () => {
    it('Result pipeables work after await', async () => {
      const r = await fromAsyncThrowable<number>(() => Promise.resolve(10));
      const mapped = r.map((x) => x * 2);
      expect(mapped.isOk()).toBe(true);
      if (mapped.isOk()) expect(mapped.value).toBe(20);
    });
  });
});

describe('cross-module smoke', () => {
  it('ok / err remain importable', () => {
    expect(ok(1).isOk()).toBe(true);
    expect(err('e').isErr()).toBe(true);
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
});
