```typescript
'use server';

import { handleServerError } from './handleServerError';
import type { ServerActionResult } from '@/types/server-actions';
import { isAbortError } from '@/api/apiService/utils';

type ActionOptions = { signal?: AbortSignal };

const hasSignal = (value: unknown): value is ActionOptions & { signal: AbortSignal } =>
  typeof value === 'object' &&
  value !== null &&
  'signal' in value &&
  value.signal instanceof AbortSignal;

const raceWithAbort = async <T>(actionCall: () => Promise<T>, signal: AbortSignal): Promise<T> => {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

  const abortPromise = new Promise<never>((_, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

  return Promise.race([actionCall(), abortPromise]);
};

/**
 * Варіант 1. Приймає зовнішній `{ signal }` як опційний останній аргумент.
 * Виклик: const { run, abort } = getResumeResult(jobId, { signal });
 */
export const createAsyncServerAction = <TArgs extends unknown[], TResponse>(
  action: (...args: [...TArgs, ActionOptions?]) => Promise<TResponse>,
) => {
  return (...args: [...TArgs, ActionOptions?]) => {
    const maybeOptions = args.at(-1);
    const signal = hasSignal(maybeOptions) ? maybeOptions.signal : undefined;

    const run = async (): Promise<ServerActionResult<TResponse>> => {
      try {
        const data = signal
          ? await raceWithAbort(() => action(...(args as Parameters<typeof action>)), signal)
          : await action(...(args as Parameters<typeof action>));

        return { success: true, data };
      } catch (error) {
        if (isAbortError(error)) throw error;
        return handleServerError(error);
      }
    };

    return { run };
  };
};

/**
 * Варіант 2. Створює власний AbortController і повертає abort().
 * Виклик: const { run, abort } = getResumeResult(jobId);
 */
export const createAbortableServerAction = <TArgs extends unknown[], TResponse>(
  action: (...args: [...TArgs, ActionOptions]) => Promise<TResponse>,
) => {
  return (...args: TArgs) => {
    const controller = new AbortController();

    const run = async (): Promise<ServerActionResult<TResponse>> => {
      try {
        const data = await raceWithAbort(
          () => action(...args, { signal: controller.signal }),
          controller.signal,
        );
        return { success: true, data };
      } catch (error) {
        if (isAbortError(error)) throw error;
        return handleServerError(error);
      }
    };

    const abort = () => controller.abort();

    return { run, abort };
  };
};
```

Приклад, як «абортити» з клієнта виклик server action: ми не зупинимо виконання на сервері, але перестанемо чекати його результат і не будемо оновлювати UI.

```typescript
// utils/clientAbort.ts
import { isAbortError } from '@/api/apiService/utils';
import type { ServerActionResult } from '@/types/server-actions';

export async function callServerActionWithAbort<T>(
  actionCall: () => Promise<ServerActionResult<T>>,
  signal?: AbortSignal,
): Promise<ServerActionResult<T>> {
  if (!signal) return actionCall();

  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

  const abortPromise = new Promise<never>((_, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

  try {
    return await Promise.race([actionCall(), abortPromise]);
  } catch (error) {
    if (isAbortError(error)) throw error; // даємо вийти назовні як AbortError
    throw error;
  }
}

// Використання у компоненті:
const controller = new AbortController();

callServerActionWithAbort(() => analyzeResume(payload), controller.signal)
  .then((res) => {
    if (res.success) setData(res.data);
    else setError(res.error);
  })
  .catch((err) => {
    if (err.name === 'AbortError') return; // тихо ігноруємо
    setError({ code: 'UNKNOWN', message: String(err) });
  });

// коли треба скасувати (напр. unmount або “cancel” кнопка):
controller.abort();
```
