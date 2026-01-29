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

    const isNetworkError =
      error instanceof TypeError &&
      (error.message === 'Failed to fetch' || // Chrome/FF
        error.message.includes('NetworkError') || // Edge/Safari triggers
        error.message.includes('Load failed')); // Safari (ios) sometimes

    // CORS, DNS errors, Connection Refused
    if (isNetworkError) {
      return {
        success: false,
        error: {
          httpStatus: 0,
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Firewall or DNS issue.',
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
        message: 'An unexpected error occurred.',
        data: {
          cause: error,
          isDigest: isNextDigestError,
        },
      } satisfies AppError,
    };
  }
}
