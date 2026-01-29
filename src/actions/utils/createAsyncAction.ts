'use server';

import { handleServerError } from './handleServerError';
import type { ServerActionResult } from '@/types/server-actions';

export const createAsyncServerAction = <TArgs extends unknown[], TResponse>(
  action: (...args: TArgs) => Promise<TResponse>,
) => {
  return async (...args: TArgs): Promise<ServerActionResult<TResponse>> => {
    try {
      const data = await action(...args);

      return { success: true, data };
    } catch (error) {
      return handleServerError(error);
    }
  };
};
