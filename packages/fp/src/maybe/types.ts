/**
 * Maybe type interfaces: Some, None, Maybe
 */

/**
 * Some variant of Maybe - represents a present value
 */
export interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

/**
 * None variant of Maybe - represents an absent value
 */
export interface None {
  readonly _tag: 'None';
}

/**
 * Discriminated union of Some and None
 */
export type Maybe<T> = Some<T> | None;

// Instance methods
export interface MaybeInstance<T> {
  /**
   * Transform the value if Some
   */
  map<B>(fn: (value: T) => B): Maybe<B>;

  /**
   * Chain Maybe computations
   */
  flatMap<B>(fn: (value: T) => Maybe<B>): Maybe<B>;

  /**
   * Filter based on predicate
   */
  filter(predicate: (value: T) => boolean): Maybe<T>;

  /**
   * Filter and map in one step
   */
  filterMap<B>(fn: (value: T) => Maybe<B>): Maybe<B>;

  /**
   * Execute side effect without transforming the value
   */
  tap(fn: (value: T) => unknown): Maybe<T>;

  /**
   * Execute async side effect
   */
  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Maybe<T>>;

  /**
   * Pattern matching
   */
  match<U>(handlers: { some: (value: T) => U; none: () => U }): U;

  /**
   * Fold to a single value
   */
  fold<U>(onSome: (value: T) => U, onNone: () => U): U;

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
   * Safe property access
   */
  get<K extends keyof T>(key: K): Maybe<T[K]>;

  /**
   * Convert to Result
   */
  toResult<E>(error: E): import('../result/types').Result<T, E>;

  /**
   * Convert to array
   */
  toArray(): T[];

  /**
   * Convert to iterable
   */
  toIterable(): Iterable<T>;

  /**
   * Type guard
   */
  isSome(): this is Some<T>;

  /**
   * Type guard
   */
  isNone(): this is None;
}