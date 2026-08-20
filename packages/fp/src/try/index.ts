/**
 * @deprecated Use {@link Result.fromThrowable} /
 * {@link Result.fromAsyncThrowable} from `result/` directly. This
 * facade is kept as a stable alias surface so consumers can keep
 * importing `try_` / `tryPromise` from `@deessejs/fp` while the
 * underlying reasoning is unified on `Result`.
 */

export { fromThrowable as try_, fromAsyncThrowable as tryPromise } from '../result/wrapping.js';

export { attempt, withReporting, classifyError } from '../result/index.js';
