/**
 * Retry strategies — public module exports.
 */

export { exponential, type ExponentialOptions } from './strategies/exponential.js';
export { linear, type LinearOptions } from './strategies/linear.js';
export { constantDelay, type ConstantDelayOptions } from './strategies/constant-delay.js';
export { jitter, type JitterOptions } from './strategies/jitter.js';