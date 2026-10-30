import type { StandardSchemaV1 } from '@standard-schema/spec';

/** Infer the input type accepted by a Standard Schema. */
export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['input'];

/** Infer the output type produced by a Standard Schema. */
export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['output'];
