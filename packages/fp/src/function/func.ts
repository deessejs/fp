import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { InferInput, InferOutput } from './standard-schema.js';

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
    Promise.resolve()
      .then(() => config.args['~standard'].validate(input))
      .then<Awaited<Return>>(async (validation): Promise<Awaited<Return>> => {
        if ('issues' in validation && validation.issues !== undefined) {
          throw new TypeError('Function arguments failed validation', {
            cause: validation.issues,
          });
        }

        return await config.handler(validation.value);
      });
}
