export const FIRESTORE_BACKGROUND_TIMEOUT_MS = 4500;

export const isFirestoreOfflineError = (error: unknown) => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message.toLowerCase() : String(error);

  return (
    code === "unavailable" ||
    code === "firestore/unavailable" ||
    message.includes("client is offline") ||
    message.includes("offline") ||
    message.includes("network")
  );
};

export const getFirestoreErrorMessage = (
  error: unknown,
  fallback = "Unable to reach Firestore right now.",
) => {
  if (isFirestoreOfflineError(error)) {
    return "You appear to be offline. We will keep retrying in the background.";
  }

  return error instanceof Error ? error.message : fallback;
};

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

export const logBackgroundFirestoreError = (context: string, error: unknown) => {
  if (isFirestoreOfflineError(error)) {
    console.info(`${context}: Firestore is offline; continuing without blocking.`);
    return;
  }

  console.warn(context, error);
};
