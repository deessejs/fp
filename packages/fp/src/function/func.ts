/**
 * A minimal copy of the Standard Schema v1 contract. Keeping this structural
 * avoids making schema libraries a dependency of `@deessejs/fp`.
 */
interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly types?: {
      readonly input: Input;
      readonly output: Output;
    };
    readonly validate: (
      value: unknown,
      options?: { readonly libraryOptions?: Record<string, unknown> }
    ) =>
      | { readonly value: Output; readonly issues?: undefined }
      | { readonly issues: ReadonlyArray<StandardSchemaIssue> }
      | Promise<
          | { readonly value: Output; readonly issues?: undefined }
          | { readonly issues: ReadonlyArray<StandardSchemaIssue> }
        >;
  };
}

interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
}

type InferInput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['input'];

type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['output'];

/**
 * Create a typed function that validates its arguments with a Standard Schema
 * before invoking its handler.
 *
 * The returned function is always asynchronous because Standard Schema
 * validators may validate asynchronously. The handler receives the validated
 * output type, which may differ from the input type when the schema transforms
 * its value.
 *
 * @example
 * ```ts
 * const parseConfig = func({
 *   args: configSchema,
 *   handler: (args) => parseConfigFile(args.content),
 * });
 *
 * const config = await parseConfig({ content: '...' });
 * ```
 */
export function func<Schema extends StandardSchemaV1, Return>(config: {
  readonly args: Schema;
  readonly handler: (args: InferOutput<Schema>) => Return;
}): (input: InferInput<Schema>) => Promise<Awaited<Return>> {
  return (input) =>
    Promise.resolve(config.args['~standard'].validate(input)).then<Awaited<Return>>(
      async (validation): Promise<Awaited<Return>> => {
        if ('issues' in validation && validation.issues !== undefined) {
          throw new TypeError('Function arguments failed validation', {
            cause: validation.issues,
          });
        }

        return await config.handler(validation.value);
      }
    );
}
