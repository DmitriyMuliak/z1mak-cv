import { AppError, ServerActionResult } from '@/types/server-actions';

export async function clientSafeAction<T>(
  actionPromise: Promise<ServerActionResult<T>>,
): Promise<ServerActionResult<T>> {
  try {
    return await actionPromise;
  } catch (error) {
    console.error('[Client] Action invocation error:', error);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        error: {
          httpStatus: 0,
          code: 'NO_INTERNET',
          message: 'No internet connection. Please check your network.',
          data: { cause: error },
        } satisfies AppError,
      };
    }

    const isFetchError =
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'));

    // CORS, DNS errors, Connection Refused
    if (isFetchError) {
      return {
        success: false,
        error: {
          httpStatus: 0,
          code: 'NETWORK_ERROR',
          message: 'Unable to reach the server. It might be down or blocked.',
          data: { cause: error },
        } satisfies AppError,
      };
    }

    const isNextDigestError = typeof error === 'object' && error !== null && 'digest' in error;

    return {
      success: false,
      error: {
        httpStatus: 0,
        code: 'UNKNOWN_CLIENT_ERROR',
        message: 'An unexpected client error occurred.',
        data: {
          cause: error,
          isDigest: isNextDigestError,
        },
      } satisfies AppError,
    };
  }
}
