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

я хочу мати
serverAction.ts // (with 'use server' directive) contain analyzeResume ()
clientAction.ts // (WITHOUT 'use server' directive) contain const act = (p) => callServerActionWithAbort(analyzeResume(p));
clientReactComponent.tsx // client comp which imports "act"

Так можна, якщо дотриматись двох правил:

server action викликається тільки всередині лямбди (щоб не стартував під час імпорту);
abort робимо на клієнті через свій AbortController, а не через значення, яке повертає server action.
Робочий шаблон:

```typescript
// serverAction.ts  ('use server')
'use server';
import { apiCvAnalyser } from '@/api/server';
import { ApiRoutes } from '@/api/server/apiRoutes';

export async function analyzeResume(payload: AnalyzePayload) {
  return apiCvAnalyser.post(ApiRoutes.CV_ANALYSER.analyze, { payload });
}
// client/utils/callServerActionWithAbort.ts  (без 'use server')
import { isAbortError } from '@/api/apiService/utils';

export function callServerActionWithAbort<T>(
  actionCall: () => Promise<T>,
  controller?: AbortController,
) {
  const signal = controller?.signal;

  const run = async (): Promise<T> => {
    if (!signal) return actionCall();
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    let onAbort: (() => void) | undefined;
    const abortPromise = new Promise<never>((_, reject) => {
      onAbort = () => {
        signal.removeEventListener('abort', onAbort!);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      signal.addEventListener('abort', onAbort, { once: true });
    });

    try {
      return await Promise.race([actionCall(), abortPromise]);
    } finally {
      if (onAbort) signal.removeEventListener('abort', onAbort);
    }
  };

  const abort = () => controller?.abort();

  return { run, abort };
}
// clientAction.ts  (без 'use server')
import { analyzeResume } from '@/actions/resume/resumeActions';
import { callServerActionWithAbort } from '@/client/utils/callServerActionWithAbort';

export const act = (payload: AnalyzePayload, controller?: AbortController) =>
  callServerActionWithAbort(() => analyzeResume(payload), controller);
// client component
const controller = useMemo(() => new AbortController(), []);
const { run, abort } = act(params, controller);

useEffect(() => {
  run().catch((e) => {
    if (isAbortError(e)) return;
    // інші помилки
  });
  return () => abort(); // скасовуємо запит при unmount/переключенні
}, [run, abort]);
// Що важливо:

// act (клієнтський файл) може імпортувати server action — Next згенерує проксі, але запит піде лише коли викличеш run().
// Не можна повертати з server action об’єкт із функціями — він має повертати серіалізовні дані; тому run/abort створюємо на клієнті.
```
