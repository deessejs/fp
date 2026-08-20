import { describe, it, expect, vi } from 'vitest';
import { withReporting, ok, err } from '@deessejs/fp';
import type { ErrorReporter, ErrorContext } from '@deessejs/fp';

describe('withReporting', () => {
  it('returns Ok when the operation succeeds', async () => {
    const reporter: ErrorReporter = { report: () => {} };
    const out = await withReporting(() => 10, 'op', reporter);
    expect(out.isOk()).toBe(true);
    if (out.isOk()) expect(out.value).toBe(10);
  });

  it('invokes the reporter with the original cause on failure', async () => {
    const cause = new Error('boom');
    const report = vi.fn();
    const reporter: ErrorReporter = { report };
    const out = await withReporting(
      () => {
        throw cause;
      },
      'op',
      reporter,
      { requestId: 'r-1' },
    );
    expect(out.isErr()).toBe(true);
    expect(report).toHaveBeenCalledTimes(1);
    const [reportedCause, ctx] = report.mock.calls[0] as [unknown, ErrorContext];
    expect(reportedCause).toBe(cause);
    expect(ctx.operation).toBe('op');
    expect(ctx.metadata).toEqual({ requestId: 'r-1' });
    expect(typeof ctx.timestamp).toBe('number');
  });

  it('wraps the error in a ReportableError with cause and message', async () => {
    const cause = new Error('boom');
    const reporter: ErrorReporter = { report: () => {} };
    const out = await withReporting<number>(
      () => {
        throw cause;
      },
      'op',
      reporter,
    );
    expect(out.isErr()).toBe(true);
    if (out.isErr()) {
      expect(out.error._tag).toBe('ReportableError');
      expect(out.error.message).toBe('boom');
      expect(out.error.cause).toBe(cause);
    }
  });

  it('uses a fallback message when the cause is not an Error', async () => {
    const reporter: ErrorReporter = { report: () => {} };
    const out = await withReporting<number>(
      () => {
        throw 'string-throw';
      },
      'op',
      reporter,
    );
    expect(out.isErr()).toBe(true);
    if (out.isErr()) {
      expect(out.error.message).toBe('Operation failed');
      expect(out.error.cause).toBe('string-throw');
    }
  });

  it('omits metadata when none is supplied', async () => {
    const report = vi.fn();
    const out = await withReporting(
      () => {
        throw new Error('boom');
      },
      'op',
      { report },
    );
    expect(out.isErr()).toBe(true);
    const [, ctx] = report.mock.calls[0] as [unknown, ErrorContext];
    expect(ctx.metadata).toBeUndefined();
  });

  it('awaits async operations', async () => {
    const reporter: ErrorReporter = { report: () => {} };
    const out = await withReporting(async () => 10, 'op', reporter);
    expect(out.isOk()).toBe(true);
    if (out.isOk()) expect(out.value).toBe(10);
  });

  describe('cross-module smoke', () => {
    it('references ok and err', () => {
      expect(ok(1).isOk()).toBe(true);
      expect(err('e').isErr()).toBe(true);
    });
  });
});
