---
"@deessejs/fp": minor
---

refactor(fp): unify error handling on Result, retire the Try module

The standalone Try type is gone. Wrapping throwing functions is now part of the Result surface.

New public API:
- Result.fromThrowable(thunk or { onSuccess, onError }) returns Result<T, E>
- Result.fromAsyncThrowable(thunk or { onSuccess, onError }) returns Promise<Result<T, E>>
- UnhandledException, AttemptConfig, Attempt, NormalizedError, RetryConfig, DelayStrategy, ErrorReporter, ErrorContext, ReportableError, ErrorClassification, ClassificationRule, ErrorConstructor types live on Result
- attempt, withReporting, classifyError are top-level exports backed by result/ modules

Removed (no aliases; the previous Try PR was never published to npm):
- Success, Failure, Try types
- success, failure factories
- try_, tryPromise aliases
- mapTry, flatMapTry, matchTry, isSuccess, isFailure pipeables (and 11 others)
- _tag Success / Failure discriminants
- The src/try/ directory entirely

Coverage stays at 100% on lines / branches / functions / statements.

See docs/internal/product/features/result.md for the canonical documentation, including a new Wrapping Throwing Functions section.
