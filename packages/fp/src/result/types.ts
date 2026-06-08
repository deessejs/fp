/**
 * Ok variant of Result - represents a successful computation
 */
export interface Ok<T, E = never> {
  readonly _tag: 'Ok';
  readonly value: T;
}

/**
 * Err variant of Result - represents a failed computation
 */
export interface Err<T = never, E> {
  readonly _tag: 'Err';
  readonly error: E;
}

/**
 * Discriminated union of Ok and Err
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

// Instance methods
export interface ResultInstance<T, E> {
  /**
   * Transform the Ok value
   */
  map<B>(fn: (value: T) => B): Result<B, E>;

  /**
   * Chain computations that may fail
   */
  flatMap<B, E2>(fn: (value: T) => Result<B, E2>): Result<B, E | E2>;

  /**
   * Transform the Err value (supports @deessejs/errors)
   */
  mapError<E2>(fn: (error: E) => E2): Result<T, E2>;

  /**
   * Filter Ok values based on a predicate
   */
  filter(predicate: (value: T) => boolean, errorFn?: (value: T) => E): Result<T, E>;

  /**
   * Execute side effect without transforming the value
   */
  tap(fn: (value: T) => unknown): Result<T, E>;

  /**
   * Execute async side effect without transforming the value
   */
  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Result<T, E>>;

  /**
   * Async variant of flatMap
   */
  flatMapAsync<B, E2>(fn: (value: T) => Promise<Result<B, E2>>): Promise<Result<B, E | E2>>;

  /**
   * Pattern matching
   */
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U;

  /**
   * Fold to a single value
   */
  fold<U>(onOk: (value: T) => U, onErr: (error: E) => U): U;

  /**
   * Get value or default
   */
  getOrElse(defaultValue: T): T;

  /**
   * Get value or throw
   */
  getOrThrow(message?: string): T;

  /**
   * Get value or null
   */
  getOrNull(): T | null;

  /**
   * Get value or undefined
   */
  getOrUndefined(): T | undefined;

  /**
   * Convert to Maybe
   */
  toMaybe(): import('../maybe/types').Maybe<T>;

  /**
   * Type guard
   */
  isOk(): this is Ok<T, E>;

  /**
   * Type guard
   */
  isErr(): this is Err<T, E>;
}