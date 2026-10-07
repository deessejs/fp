/**
 * Public surface of the poll module.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

export type { Pending, Done, Failed, Poll, PollOptions, PollConfig } from './types.js';
export { pending, done, failed } from './constants.js';
export { poll } from './functions.js';
