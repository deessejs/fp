import { describe, it, expect } from 'vitest';
import { success, failure, try_, tryPromise, ok, err } from '@deessejs/fp';

describe('success / failure factories', () => {
  it('success carries the value', () => {
    expect(success(10).value).toBe(10);
    expect(success(10)._tag).toBe('Success');
  });

  it('failure carries the cause', () => {
    expect(failure('e').cause).toBe('e');
    expect(failure('e')._tag).toBe('Failure');
  });
});

describe('try_', () => {
  describe('thunk overload', () => {
    it('returns Success when the thunk returns', () => {
      const out = try_<number>(() => 10);
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(10);
    });

    it('returns Failure(UnhandledException) when the thunk throws', () => {
      const out = try_<number>(() => {
        throw new Error('boom');
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) {
        expect(out.cause._tag).toBe('UnhandledException');
        expect((out.cause.cause as Error).message).toBe('boom');
      }
    });

    it('captures non-Error throws as-is', () => {
      const out = try_<number>(() => {
        throw 'string-throw';
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) {
        expect(out.cause.cause).toBe('string-throw');
      }
    });
  });

  describe('options overload', () => {
    it('returns Success when onSuccess returns', () => {
      const out = try_<number, string>({
        onSuccess: () => 10,
        onError: () => 'e',
      });
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(10);
    });

    it('returns Failure mapped via onError when onSuccess throws', () => {
      const out = try_<number, string>({
        onSuccess: () => {
          throw new Error('boom');
        },
        onError: (cause) => `mapped:${(cause as Error).message}`,
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('mapped:boom');
    });

    it('captures non-Error throws and maps them through onError', () => {
      const out = try_<number, string>({
        onSuccess: () => {
          throw 42;
        },
        onError: (cause) => `got:${cause}`,
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('got:42');
    });
  });
});

describe('tryPromise', () => {
  describe('thunk overload', () => {
    it('returns Success when the promise resolves', async () => {
      const out = await tryPromise<number>(() => Promise.resolve(10));
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(10);
    });

    it('returns Failure(UnhandledException) when the promise rejects', async () => {
      const out = await tryPromise<number>(() => Promise.reject(new Error('boom')));
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) {
        expect(out.cause._tag).toBe('UnhandledException');
        expect((out.cause.cause as Error).message).toBe('boom');
      }
    });

    it('returns Failure when the thunk throws synchronously', async () => {
      const out = await tryPromise<number>(() => {
        throw new Error('sync-throw');
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) {
        expect((out.cause.cause as Error).message).toBe('sync-throw');
      }
    });

    it('captures non-Error rejections as-is', async () => {
      const out = await tryPromise<number>(() => Promise.reject('string-reject'));
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) {
        expect(out.cause.cause).toBe('string-reject');
      }
    });
  });

  describe('options overload', () => {
    it('returns Success when onSuccess resolves', async () => {
      const out = await tryPromise<number, string>({
        onSuccess: () => Promise.resolve(10),
        onError: () => 'e',
      });
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(10);
    });

    it('returns Failure mapped via onError when onSuccess rejects', async () => {
      const out = await tryPromise<number, string>({
        onSuccess: () => Promise.reject(new Error('boom')),
        onError: (cause) => `mapped:${(cause as Error).message}`,
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('mapped:boom');
    });

    it('returns Failure mapped via async onError', async () => {
      const out = await tryPromise<number, string>({
        onSuccess: () => Promise.reject(new Error('boom')),
        onError: async (cause) => `async:${(cause as Error).message}`,
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('async:boom');
    });

    it('maps synchronous throws from onSuccess through onError', async () => {
      const out = await tryPromise<number, string>({
        onSuccess: () => {
          throw new Error('sync');
        },
        onError: (cause) => `caught:${(cause as Error).message}`,
      });
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('caught:sync');
    });
  });
});

describe('cross-module smoke', () => {
  it('imports ok and err from the result module', () => {
    expect(ok(1).isOk()).toBe(true);
    expect(err('e').isErr()).toBe(true);
  });
});
