/**
 * Wraps a Promise with a timeout. 
 * If the promise does not resolve within `ms` milliseconds, it logs a warning
 * but allows the original promise to continue in the background.
 *
 * @param promise   The promise to wrap
 * @param ms        Timeout in milliseconds (default: 30000)
 * @param label     Label for logging
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  ms = 30000,
  label = 'Operation'
): Promise<T> => {
  let timeoutReached = false;

  const timer = setTimeout(() => {
    timeoutReached = true;
    console.warn(`[Timeout Warning] ${label} is taking longer than ${ms}ms. Continuing...`);
  }, ms);

  try {
    const result = await promise;
    return result;
  } finally {
    clearTimeout(timer);
    if (timeoutReached) {
      console.log(`[Timeout Resolved] ${label} eventually completed.`);
    }
  }
};

/**
 * Retries an async operation with exponential backoff.
 * Only fails after all retries are exhausted.
 *
 * @param fn        The async function to retry
 * @param maxTries  Maximum number of attempts (default: 3)
 * @param baseDelay Base delay in ms (default: 1000ms)
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxTries = 3,
  baseDelay = 1000,
  label = 'Operation'
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxTries;

      // Do not retry on permission errors
      if (error?.code === 'permission-denied') {
        console.error(`[Permission Error] ${label} failed due to insufficient permissions.`);
        throw error;
      }

      console.warn(
        `[Retry] ${label} failed (attempt ${attempt}/${maxTries}). ` +
        `Code: ${error?.code} | Message: ${error?.message}`
      );

      if (!isLastAttempt) {
        // Linear-ish backoff: 1s, 2s, 3s... or exponential if preferred.
        const delay = baseDelay * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`[Retry Error] ${label} failed after ${maxTries} attempts.`);
  throw lastError;
};

/**
 * Helper to execute a firestore call with both retry and a soft timeout warning.
 */
export const safeFirestoreCall = <T>(
  fn: () => Promise<T>,
  label = 'Firestore operation'
): Promise<T> => {
  return withTimeout(
    retryWithBackoff(fn, 3, 1000, label),
    30000,
    label
  );
};
/**
 * Helper to remove undefined values from an object before Firestore write.
 */
export const removeUndefined = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
