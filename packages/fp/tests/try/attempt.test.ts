import { describe, it, expect } from 'vitest';
import { attempt, success, failure } from '@deessejs/fp';

class BoomError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'BoomError';
  }
}

describe('attempt', () => {
  describe('execute()', () => {
    it('returns Ok when the operation succeeds', async () => {
      const a = attempt<number>({
        onSuccess: () => 10,
      });
      const out = await a.execute();
      expect(out.isOk()).toBe(true);
      if (out.isOk()) expect(out.value).toBe(10);
    });

    it('returns Err with the raw cause when the operation throws', async () => {
      const cause = new BoomError('boom');
      const a = attempt<number>({
        onSuccess: () => {
          throw cause;
        },
      });
      const out = await a.execute();
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe(cause);
    });

    it('returns Err with the normalised cause when normalize is supplied', async () => {
      const a = attempt<string>({
        onSuccess: () => {
          throw new BoomError('boom');
        },
        normalize: (e) => (e instanceof Error ? e.message : 'unknown'),
      });
      const out = await a.execute();
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('boom');
    });

    it('performs a single retry when retry.shouldRetry returns true', async () => {
      let attempts = 0;
      const a = attempt<number>({
        onSuccess: () => {
          attempts++;
          if (attempts < 2) throw new BoomError('transient');
          return 99;
        },
        retry: {
          attempts: 1,
          delay: { kind: 'constant', baseMs: 0 },
          shouldRetry: () => true,
        },
      });
      const out = await a.execute();
      expect(attempts).toBe(2);
      expect(out.isOk()).toBe(true);
      if (out.isOk()) expect(out.value).toBe(99);
    });

    it('does not retry when retry.shouldRetry returns false', async () => {
      let attempts = 0;
      const a = attempt<number>({
        onSuccess: () => {
          attempts++;
          throw new BoomError('boom');
        },
        retry: {
          attempts: 1,
          delay: { kind: 'constant', baseMs: 0 },
          shouldRetry: () => false,
        },
      });
      const out = await a.execute();
      expect(attempts).toBe(1);
      expect(out.isErr()).toBe(true);
    });

    it('does not retry when no retry config is supplied', async () => {
      let attempts = 0;
      const a = attempt<number>({
        onSuccess: () => {
          attempts++;
          throw new BoomError('boom');
        },
      });
      await a.execute();
      expect(attempts).toBe(1);
    });

    it('retried failure returns Err with the normalised second-attempt cause', async () => {
      let attempts = 0;
      const a = attempt<string>({
        onSuccess: () => {
          attempts++;
          throw new BoomError(`attempt-${attempts}`);
        },
        retry: {
          attempts: 1,
          delay: { kind: 'constant', baseMs: 0 },
          shouldRetry: () => true,
        },
        normalize: (e) => (e instanceof Error ? e.message : 'unknown'),
      });
      const out = await a.execute();
      expect(attempts).toBe(2);
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('attempt-2');
    });

    it('retried failure without normalize carries the raw second-attempt cause', async () => {
      let attempts = 0;
      const second = new BoomError('second');
      const a = attempt<number>({
        onSuccess: () => {
          attempts++;
          if (attempts < 2) throw new BoomError('first');
          throw second;
        },
        retry: {
          attempts: 1,
          delay: { kind: 'constant', baseMs: 0 },
          shouldRetry: () => true,
        },
      });
      const out = await a.execute();
      expect(attempts).toBe(2);
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe(second);
    });
  });

  describe('clientSafe()', () => {
    it('returns Ok on success', async () => {
      const a = attempt<number>({
        onSuccess: () => 10,
      });
      const out = await a.clientSafe();
      expect(out.isOk()).toBe(true);
      if (out.isOk()) expect(out.value).toBe(10);
    });

    it('returns Err(NormalizedError) using default on failure without normalize', async () => {
      const a = attempt<number>({
        onSuccess: () => {
          throw new BoomError('boom');
        },
      });
      const out = await a.clientSafe();
      expect(out.isErr()).toBe(true);
      if (out.isErr()) {
        expect(out.error.code).toBe('INTERNAL_ERROR');
        expect(out.error.status).toBe(500);
        expect(out.error.public).toBe(false);
        expect(out.error.message).toBe('An unexpected error occurred');
      }
    });

    it('uses the normalize-returned NormalizedError when shape matches', async () => {
      const a = attempt<number>({
        onSuccess: () => {
          throw new BoomError('boom');
        },
        normalize: () => ({
          code: 'BOOM',
          message: 'safe message',
          status: 503,
          public: true,
        }),
      });
      const out = await a.clientSafe();
      expect(out.isErr()).toBe(true);
      if (out.isErr()) {
        expect(out.error.code).toBe('BOOM');
        expect(out.error.status).toBe(503);
        expect(out.error.public).toBe(true);
        expect(out.error.message).toBe('safe message');
      }
    });

    it('falls back to default when normalize returns a malformed shape', async () => {
      const a = attempt<number>({
        onSuccess: () => {
          throw new BoomError('boom');
        },
        normalize: () => ({ wrong: 'shape' }),
      });
      const out = await a.clientSafe();
      expect(out.isErr()).toBe(true);
      if (out.isErr()) {
        expect(out.error.code).toBe('INTERNAL_ERROR');
      }
    });
  });

  describe('cross-module smoke', () => {
    it('references success and failure', () => {
      expect(success(1).isSuccess()).toBe(true);
      expect(failure('e').isFailure()).toBe(true);
    });
  });
});
