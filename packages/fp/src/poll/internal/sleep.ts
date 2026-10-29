/**
 * Internal sleep helper. Extracted so tests can substitute a fake
 * clock if needed in the future, and so the runner is testable
 * without real-time waits.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
