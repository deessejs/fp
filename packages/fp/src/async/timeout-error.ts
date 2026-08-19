/**
 * TimeoutError — thrown when an async operation exceeds its time bound.
 */
export class TimeoutError extends Error {
  override readonly name = 'TimeoutError' as const;

  constructor(message: string = 'Operation timed out') {
    super(message);
  }
}