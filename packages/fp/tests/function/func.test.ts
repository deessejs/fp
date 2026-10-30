import { describe, expect, expectTypeOf, it } from 'vitest';
import { func } from '@deessejs/fp';

interface Schema<Input, Output> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly types?: {
      readonly input: Input;
      readonly output: Output;
    };
    readonly validate: (
      value: unknown
    ) =>
      | { readonly value: Output; readonly issues?: undefined }
      | { readonly issues: ReadonlyArray<{ readonly message: string }> }
      | Promise<
          | { readonly value: Output; readonly issues?: undefined }
          | { readonly issues: ReadonlyArray<{ readonly message: string }> }
        >;
  };
}

function schema<Input, Output>(
  validate: Schema<Input, Output>['~standard']['validate']
): Schema<Input, Output> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate,
    },
  };
}

describe('func', () => {
  it('validates input and passes the schema output to the handler', async () => {
    const args = schema<{ content: string }, { normalized: string }>((input) => {
      if (
        typeof input !== 'object' ||
        input === null ||
        !('content' in input) ||
        typeof input.content !== 'string'
      ) {
        return { issues: [{ message: 'Expected content to be a string' }] };
      }

      return { value: { normalized: input.content.trim() } };
    });

    const parseConfig = func({
      args,
      handler: (validated) => validated.normalized.toUpperCase(),
    });

    expectTypeOf(parseConfig).toEqualTypeOf<(input: { content: string }) => Promise<string>>();
    // @ts-expect-error The schema input requires a string content field.
    const invalidInput: Parameters<typeof parseConfig>[0] = { content: 42 };
    void invalidInput;
    expect(await parseConfig({ content: '  config  ' })).toBe('CONFIG');
  });

  it('awaits asynchronous schema validation and handler results', async () => {
    const args = schema<string, string>(async (input) => ({
      value: String(input).trim(),
    }));

    const normalize = func({
      args,
      handler: async (value) => value.toUpperCase(),
    });

    expect(await normalize(' value ')).toBe('VALUE');
  });

  it('rejects invalid arguments with the schema issues as the cause', async () => {
    const issues = [{ message: 'Expected a string' }];
    const args = schema<unknown, string>(() => ({ issues }));
    const parse = func({ args, handler: (value) => value });

    await expect(parse(42)).rejects.toMatchObject({
      name: 'TypeError',
      message: 'Function arguments failed validation',
      cause: issues,
    });
  });
});
