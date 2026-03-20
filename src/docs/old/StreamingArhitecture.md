# JSON Patch Streaming — Implementation Plan

## Контекст і архітектура

### Що змінюємо і навіщо

Зараз Worker пише сирі текстові чанки у Redis Stream, а фронтенд склеює рядок і парсить JSON тільки коли все готово. Це означає:

- UI не може рендерити окремі поля по мірі надходження
- При будь-якому оновленні — ре-рендер усього компонента

**Рішення:** Worker конвертує JSON stream у RFC 6902 патчі → SSE endpoint пересилає патчі → фронтенд застосовує `applyPatch()` → Zustand ре-рендерить тільки підписані компоненти.

### Головне правило

**Патчі генерує Worker, SSE endpoint їх тільки читає з Redis і пересилає.** Endpoint не порівнює нічого — Redis Stream є готовим ordered patch log-ом.

### Повний flow

```
LLM text stream (raw JSON chunks)
        ↓
[Worker] for await chunk → parser.write(chunk)
        ↓
[Worker] @streamparser/json onValue — fires when a top-level section completes
         (overallAnalysis, quantitativeMetrics, …)
        ↓
[Worker] fast-json-patch.compare(prev, curr) → RFC 6902 ops → pendingOps
        ↓
[Worker] after each chunk: if pendingOps → flushOps() → xadd Redis Stream
         ID:1748-1  { type:'patch', ops:[{op:'add', path:'/overallAnalysis', value:{...}}] }
         ID:1748-2  { type:'patch', ops:[{op:'add', path:'/quantitativeMetrics', value:{...}}] }
         ID:1748-3  { type:'done' }
        ↓
[SSE endpoint] XREAD → sendSSE(id, 'patch', { ops })   ← просто пересилає
        ↓
[Frontend] applyPatch(state, ops) → Zustand store
        ↓
[React] useStore(s => s.data?.overallAnalysis?.matchScore)  ← ре-рендер тільки цього поля
```

### Як працює reconnect

`Redis Stream Entry ID` = SSE `id:` поле = `lastEventId` у тілі запиту — це одна й та сама річ.

| Сценарій                               | Що робить backend                                                                    | Що отримує фронтенд                                |
| -------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Нове підключення (без `lastEventId`)   | `XREAD` від `0`, apply всіх patches до `{}`, відправити `snapshot` з повним об'єктом | Один `snapshot`, потім live `patch` events         |
| Reconnect (є `lastEventId = '1748-1'`) | `XREAD` від `1748-1`, відправити тільки пропущені `patch` events                     | Delta-патчі, застосовуються зверху існуючого стану |

### SSE event контракт (новий)

| Event      | Дані                                  | Коли                                              |
| ---------- | ------------------------------------- | ------------------------------------------------- |
| `patch`    | `{ ops: Operation[] }`                | Під час активного стріму (замінює `chunk`)        |
| `snapshot` | `{ content: object\|null, status }`   | Нове підключення, queued, completed/failed з бази |
| `done`     | `{ status, usedModel?, finishedAt? }` | Стрім завершено                                   |
| `error`    | `{ code, message, retryable? }`       | Помилка                                           |

> **Breaking change:** `snapshot.content` тепер `object`, не `string`. Backend і frontend деплоїти разом.

---

---

# Архітектурний рефакторинг (SOLID)

> **Читати:** обом розробникам. Цей розділ описує зміни в інфраструктурному шарі, які роблять streaming reusable.

## Проблема поточного коду

Поточний `streamingLogic.ts` порушує кілька SOLID принципів:

| Принцип  | Порушення                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| **SRP**  | `streamHistory` одночасно: читає Redis, агрегує стан, відправляє snapshot, форвардить окремі events        |
| **OCP**  | Додати нове streaming API → модифікувати `streamHistory` і live loop (closed for extension)                |
| **DRY**  | Логіка парсингу entries дублюється у reconnect-гілці `streamHistory` і в live loop `handleActiveStreaming` |
| **Типи** | `const { data: content, ...rest } = parsed` — обхід типів замість discriminated union                      |

## Рішення: Generic Stream Bridge

Виділити абстракцію `StreamEventMapper<TEntry>`, яка ізолює job-специфічну логіку від інфраструктурного коду.

**Принцип:** `bridgeStreamToSSE` нічого не знає про `patch`, `chunk` або `ops` — він знає тільки "читай Redis, відправляй SSE". Уся бізнес-логіка живе в mapper.

```
Redis Stream entries
       ↓
StreamEventMapper.parseEntry()        ← domain: parse raw Redis fields
       ↓
StreamEventMapper.toSSEEvent()        ← domain: map entry → SSE event
StreamEventMapper.buildSnapshot()     ← domain: aggregate history → snapshot
       ↓
bridgeStreamToSSE()                   ← infrastructure: XREAD → sendSSE, live loop
```

## Нові файли

### `src/utils/streamBridge.ts` — Generic SSE ↔ Redis Stream bridge

```ts
import type { FastifyReply } from 'fastify';
import type { RedisWithScripts } from '../redis/client';
import { sendSSE, sendKeepAlive } from './sse';
import type { SSEEvent, SSEData } from './sse';

export interface SnapshotResult {
  /** Redis entry ID, використовується як SSE `id:` */
  id: string;
  /** Дані для `snapshot` SSE event */
  data: SSEData;
  /** Чи треба відразу відправити `done` і закрити з'єднання */
  isCompleted: boolean;
  /** Дані для `done` event (якщо isCompleted = true) */
  doneData?: SSEData;
}

export interface StreamEventMapper<TEntry> {
  /** Парсить raw Redis fields [key, value, ...] → typed entry */
  parseEntry(fields: string[]): TEntry;

  /**
   * Для reconnect і live loop: маппить entry → SSE event.
   * Повертає null якщо цей entry не треба відправляти клієнту.
   */
  toSSEEvent(entry: TEntry): { eventType: SSEEvent; data: SSEData } | null;

  /** True якщо цей entry завершує стрім (done або error) */
  isTerminal(entry: TEntry): boolean;

  /**
   * Для нового підключення: агрегує всю history у один snapshot.
   * Приклад для patch stream: apply all patches → return final state.
   */
  buildSnapshot(history: Array<{ id: string; entry: TEntry }>): SnapshotResult;
}

/**
 * Generic bridge: читає Redis Stream history, відправляє через SSE.
 *
 * - Нове підключення (немає lastEventId): викликає mapper.buildSnapshot(),
 *   відправляє один `snapshot` event.
 * - Reconnect (є lastEventId): форвардить кожен entry через mapper.toSSEEvent().
 *
 * Повертає { lastId, isCompleted } для подальшого live loop.
 */
export async function bridgeStreamHistory<TEntry>(opts: {
  streamKey: string;
  redis: RedisWithScripts;
  reply: FastifyReply;
  mapper: StreamEventMapper<TEntry>;
  lastEventId?: string;
}): Promise<{ lastId: string; isCompleted: boolean }>;

/**
 * Live loop: блокуючий XREAD, форвардить нові entries через mapper.toSSEEvent().
 * Завершується коли: mapper.isTerminal(), з'єднання закрите, або стрім зник з Redis.
 */
export async function runLiveLoop<TEntry>(opts: {
  streamKey: string;
  redis: RedisWithScripts;
  reply: FastifyReply;
  mapper: StreamEventMapper<TEntry>;
  lastId: string;
}): Promise<void>;
```

### `src/routes/resume/patchStreamMapper.ts` — Resume-specific mapper

```ts
import { applyPatch } from 'fast-json-patch';
import type { Operation } from 'fast-json-patch';
import type { StreamEventMapper, SnapshotResult } from '../../utils/streamBridge';
import type { SSEData } from '../../utils/sse';

// Discriminated union — замінює старий StreamEntry з data?: string
type PatchEntry =
  | { type: 'patch'; ops: Operation[] }
  | { type: 'done' }
  | { type: 'error'; code?: string; message?: string };

export const patchStreamMapper: StreamEventMapper<PatchEntry> = {
  parseEntry(fields) {
    return JSON.parse(fields[1]) as PatchEntry;
  },

  toSSEEvent(entry) {
    switch (entry.type) {
      case 'patch':
        return { eventType: 'patch', data: { ops: entry.ops } };
      case 'done':
        return { eventType: 'done', data: {} };
      case 'error':
        return { eventType: 'error', data: { code: entry.code, message: entry.message } };
    }
  },

  isTerminal(entry) {
    return entry.type === 'done' || entry.type === 'error';
  },

  buildSnapshot(history): SnapshotResult {
    let state: Record<string, unknown> = {};
    let status = 'in_progress';
    let errorCode: string | undefined;
    let errorMessage: string | undefined;
    const finalId = history[history.length - 1]?.id ?? '0';

    for (const { entry } of history) {
      if (entry.type === 'patch') {
        state = applyPatch(state, entry.ops, false, false).newDocument;
      } else if (entry.type === 'done') {
        status = 'completed';
      } else if (entry.type === 'error') {
        status = 'failed';
        errorCode = entry.code;
        errorMessage = entry.message;
      }
    }

    const isCompleted = status !== 'in_progress';
    const snapshotData: SSEData = {
      content: Object.keys(state).length > 0 ? state : null,
      status,
      ...(status === 'failed' && { code: errorCode, message: errorMessage }),
    };

    return {
      id: finalId,
      data: snapshotData,
      isCompleted,
      doneData: isCompleted ? { status } : undefined,
    };
  },
};
```

## Зміни у `src/utils/sse.ts`

```ts
// Додати 'patch' до SSEEvent
export type SSEEvent = 'patch' | 'snapshot' | 'done' | 'error';

// StreamEntry видалити — переїжджає в patchStreamMapper.ts як PatchEntry
// SSEData залишається як є
```

## Зміни у `src/routes/resume/streamingLogic.ts`

`streamHistory` (з усією job-специфічною логікою) **видаляється**.

`handleActiveStreaming` стає тонким оркестратором — викликає `bridgeStreamHistory` і `runLiveLoop` з `patchStreamMapper`:

```ts
import { bridgeStreamHistory, runLiveLoop } from '../../utils/streamBridge';
import { patchStreamMapper } from './patchStreamMapper';

export async function handleActiveStreaming(...) {
  // ... meta/queued перевірка без змін ...

  const { lastId, isCompleted } = await bridgeStreamHistory({
    streamKey,
    redis,
    reply,
    mapper: patchStreamMapper,
    lastEventId,
  });

  if (isCompleted) return true;

  await runLiveLoop({ streamKey, redis, reply, mapper: patchStreamMapper, lastId });
  return true;
}
```

## Як додати новий streaming API у майбутньому

1. Створити `src/routes/<feature>/<feature>StreamMapper.ts` — реалізувати `StreamEventMapper<TEntry>`
2. Worker пише потрібний формат entries у Redis Stream
3. Route handler викликає `bridgeStreamHistory` + `runLiveLoop` з власним mapper
4. `streamBridge.ts` і `sse.ts` **не змінюються**

## Нова структура файлів

```
src/
  utils/
    sse.ts                         ← мінімальна зміна: додати 'patch' до SSEEvent
    streamBridge.ts                ← НОВИЙ: generic bridge (bridgeStreamHistory, runLiveLoop)
  routes/
    resume/
      patchStreamMapper.ts         ← НОВИЙ: resume-specific StreamEventMapper
      streamingLogic.ts            ← СПРОЩЕНИЙ: видалити streamHistory, тонкий оркестратор
      executeModel.ts              ← ЗМІНЕНИЙ: chunk → patch (як описано в Part 1)
```

---

---

# Частина 1: Backend

> **Читати:** backend-розробнику. Frontend може пропустити цю частину.

## Що залишається незмінним

| Компонент                        | Статус                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| `resume.ts` — route handler      | Без змін                                                            |
| `handleActiveStreaming`          | Без змін                                                            |
| `trySendFinishedResultFromDb`    | Мінімальна зміна: `content` вже є object (`row.result`)             |
| `trySendFinishedResultFromRedis` | Мінімальна зміна: `parseMaybeJson(result.data)` вже повертає object |
| Redis `jobResult` hash           | Без змін — зберігає повний text від LLM                             |
| `/:id/result` endpoint           | Без змін                                                            |
| Auth, rate limiting              | Без змін                                                            |

## Крок 1 — Встановити пакети

```bash
npm install @streamparser/json fast-json-patch
npm install -D @types/fast-json-patch
```

**Чому `@streamparser/json`, а не clarinet:**

- clarinet abandoned з 2019, немає TypeScript типів
- `@streamparser/json` коректно обробляє масиви (clarinet ламається на `[{...}]`), `stack` містить повний шлях включно з індексами

## Крок 2 — `src/utils/sse.ts`

Мінімальна зміна — тільки додати `'patch'` до union:

```ts
// Було: 'chunk' | 'snapshot' | 'done' | 'error'
export type SSEEvent = 'patch' | 'snapshot' | 'done' | 'error';
```

`StreamEntry` **видалити** з `sse.ts` — він переїжджає в `patchStreamMapper.ts` як `PatchEntry` (discriminated union). Це прибирає job-специфічний тип з утилітного шару.

## Крок 2.5 — Створити `src/utils/streamBridge.ts`

Реалізувати `StreamEventMapper<TEntry>`, `bridgeStreamHistory`, `runLiveLoop` — повна специфікація в розділі **Архітектурний рефакторинг** вище.

Ключові деталі реалізації:

- `bridgeStreamHistory`: `XREAD` від `lastEventId ?? '0'`, якщо немає `lastEventId` — викликає `buildSnapshot`, інакше ітерує entries через `toSSEEvent`
- `runLiveLoop`: `XREAD BLOCK 10000`, при timeout перевіряє `redis.exists(streamKey)`, при 0 — закриває з'єднання, інакше відправляє keep-alive
- Обидві функції перевіряють `reply.raw.destroyed` перед кожним записом

## Крок 2.6 — Створити `src/routes/resume/patchStreamMapper.ts`

Повна реалізація в розділі **Архітектурний рефакторинг** вище. Включає `PatchEntry` discriminated union та `patchStreamMapper` object.

## Крок 3 — `src/worker/executeModel.ts`

Це основна зміна. Worker більше не пише `{ type: 'chunk', data: '...' }` — він пише `{ type: 'patch', ops: [...] }`.

`fullText` залишається — він потрібен для `finalizeSuccess` (зберігає повний текст у `jobResult` для cold path).

Вся логіка накопичення ops винесена у `createJsonPatchCollector` (`src/utils/createJsonPatchCollector.ts`). Worker лише:

1. Передає кожен чанк у parser
2. Після кожного чанку — флашить ops у Redis якщо є (top-level секція завершилась)

`onValue` стрілятиме на глибині `stack.length === 1` (кожна завершена top-level секція: `overallAnalysis`, `quantitativeMetrics`, …) і `stack.length === 0` (весь root — fallback). Батчинг через `setTimeout` **відсутній** — flush відбувається синхронно в `for await` loop після кожного чанку.

```ts
import { JSONParser } from '@streamparser/json';
import { createJsonPatchCollector } from '../utils/createJsonPatchCollector';

// Всередині executeModel:

let fullText = '';
let isFirstWrite = true;

const collector = createJsonPatchCollector(1); // maxDepth=1: top-level секції

const flushOps = async () => {
  const ops = collector.flush();
  if (ops.length === 0) return;

  const message = JSON.stringify({ type: 'patch', ops });

  if (isFirstWrite) {
    await redis
      .pipeline()
      .xadd(streamKey, '*', 'data', message)
      .expire(streamKey, STREAM_TTL_SAFETY)
      .exec();
    isFirstWrite = false;
  } else {
    await redis.xadd(streamKey, '*', 'data', message);
  }
};

const parser = new JSONParser();
parser.onValue = collector.onValue; // section-level progressive updates

parser.onError = (err) => {
  void err; // LLM повернув невалідний JSON — логується на рівні worker
};

const stream = modelProvider.executeStream(input);
for await (const chunk of stream) {
  fullText += chunk;
  parser.write(chunk);
  await flushOps(); // flush якщо секція завершилась під час цього чанку
}

// Final flush — root completion або залишки
await flushOps();

await redis
  .pipeline()
  .xadd(streamKey, '*', 'data', JSON.stringify({ type: 'done' }))
  .expire(streamKey, STREAM_TTL_COMPLETED)
  .exec();

return { text: fullText, usedModel: model };
```

## Крок 4 — `src/routes/resume/streamingLogic.ts`

**Функцію `streamHistory` — видалити повністю.** Вся її логіка тепер живе у `patchStreamMapper.buildSnapshot()` (новий з'єднання) та у `bridgeStreamHistory` (reconnect).

**Live loop** у `handleActiveStreaming` — видалити `while` блок з парсингом entries. Замінити весь блок "Active Streaming Logic" на:

```ts
import { bridgeStreamHistory, runLiveLoop } from '../../utils/streamBridge';
import { patchStreamMapper } from './patchStreamMapper';

// У handleActiveStreaming, після перевірки meta/queued:

const { lastId, isCompleted } = await bridgeStreamHistory({
  streamKey,
  redis,
  reply,
  mapper: patchStreamMapper,
  lastEventId,
});

if (isCompleted) return true;

await runLiveLoop({
  streamKey,
  redis,
  reply,
  mapper: patchStreamMapper,
  lastId,
});

return true;
```

`trySendFinishedResultFromRedis` і `trySendFinishedResultFromDb` — **без змін** (вони вже відправляють `object` через `parseMaybeJson` та `row.result`).

## Перевірка після змін

```bash
# 1. Запустити Worker, ініціювати job
# 2. Перевірити Redis Stream:
redis-cli XRANGE job:stream:{jobId} - +
# Має показати: { type:'patch', ops:[...] }, { type:'done' }

# 3. Підключитись до SSE endpoint
curl -N -X POST http://localhost:3000/resume/{jobId}/result-stream \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{}'
# Має показати: event:snapshot, потім event:done
```

---

---

# Частина 2: Frontend

> **Читати:** frontend-розробнику після того як backend зробив свої зміни.
> **Передумова:** backend вже деплоїть `patch` events замість `chunk`.

## Що отримує фронтенд (новий контракт)

### `patch` event — нові дельта-оновлення

```ts
event: 'patch';
data: {
  ops: Array<{
    op: 'add' | 'replace' | 'remove';
    path: string; // JSON Pointer: "/score", "/sections/0/feedback"
    value?: unknown;
  }>;
}
```

**Дія:** `state = applyPatch(state, ops).newDocument`

### `snapshot` event — повний стан (змінено!)

```ts
event: 'snapshot'
data: {
  content: object | null,  // ← БУЛО string, ТЕПЕР parsed object
  status: 'queued' | 'in_progress' | 'completed' | 'failed',
  code?: string,
  message?: string
}
```

**Дія:** `state = data.content ?? {}`

### `done`, `error` — без змін

Логіка така сама як раніше.

## Крок 1 — Встановити пакети

```bash
npm install fast-json-patch zustand
```

## Крок 2 — Zustand store

```ts
// store/analysisStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { applyPatch } from 'fast-json-patch';
import type { Operation } from 'fast-json-patch';

type Status = 'idle' | 'queued' | 'in_progress' | 'completed' | 'failed';

interface AnalysisStore {
  data: Record<string, unknown>;
  status: Status;
  usedModel: string | null;
  applyPatches: (ops: Operation[]) => void;
  setSnapshot: (content: object | null, status: string) => void;
  setDone: (status: string, usedModel?: string) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  subscribeWithSelector((set, get) => ({
    data: {},
    status: 'idle',
    usedModel: null,

    applyPatches: (ops) => set({ data: applyPatch(get().data, ops, false, false).newDocument }),

    setSnapshot: (content, status) => set({ data: content ?? {}, status: status as Status }),

    setDone: (status, usedModel) => set({ status: status as Status, usedModel: usedModel ?? null }),

    reset: () => set({ data: {}, status: 'idle', usedModel: null }),
  })),
);
```

## Крок 3 — SSE handler

```ts
// hooks/useAnalysisStream.ts
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAnalysisStore } from '../store/analysisStore';

export function useAnalysisStream(jobId: string, token: string) {
  const store = useAnalysisStore.getState();

  const connect = async () => {
    const savedId = sessionStorage.getItem(`sse_cursor_${jobId}`);

    await fetchEventSource(`/resume/${jobId}/result-stream`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savedId ? { lastEventId: savedId } : {}),

      onmessage(ev) {
        // Зберігаємо cursor для reconnect
        if (ev.id && ev.id !== '0') {
          sessionStorage.setItem(`sse_cursor_${jobId}`, ev.id);
        }

        const data = JSON.parse(ev.data);

        switch (ev.event) {
          case 'patch':
            // Нова дія — була відсутня
            store.applyPatches(data.ops);
            break;

          case 'snapshot':
            // content тепер object, не string
            store.setSnapshot(data.content, data.status);
            if (data.status === 'failed') {
              showError(data.code, data.message);
            }
            break;

          case 'done':
            store.setDone(data.status, data.usedModel);
            sessionStorage.removeItem(`sse_cursor_${jobId}`);
            break;

          case 'error':
            showError(data.code, data.message);
            if (data.retryable === false) throw new Error('NON_RETRYABLE');
            break;
        }
      },

      onerror(err) {
        if (err.message === 'NON_RETRYABLE') throw err;
        // інакше fetch-event-source зробить reconnect автоматично
      },
    });
  };

  return { connect };
}
```

## Крок 4 — React компоненти з гранульованими підписками

```tsx
// Ре-рендер ТІЛЬКИ коли /score змінився
function OverallScore() {
  const score = useAnalysisStore((s) => s.data?.score);
  return <div>{score ?? <Skeleton />}</div>;
}

// Ре-рендер ТІЛЬКИ коли /sections/experience/feedback змінився
function ExperienceFeedback() {
  const feedback = useAnalysisStore((s) => s.data?.sections?.experience?.feedback);
  return <p>{feedback ?? '...'}</p>;
}

// Статус — окрема підписка
function StatusBadge() {
  const status = useAnalysisStore((s) => s.status);
  return <Badge variant={status}>{status}</Badge>;
}
```

Кожен компонент ре-рендериться незалежно тільки тоді, коли змінився саме той шлях на який він підписаний.

## Видалити стару логіку

Після міграції прибрати:

- Будь-яку обробку `case 'chunk'` — її більше немає для streaming jobs
- `buffer += data.content` — більше не потрібно
- Ручний `JSON.parse(buffer)` після завершення стріму

---

## Порядок деплою

1. Backend деплоїть зміни (Worker + streamingLogic)
2. Frontend деплоїть зміни (store + SSE handler + компоненти)
3. Деплоїти разом — `snapshot.content` змінює тип з `string` на `object`

# New Hook

107/107. Ось що створено і чим відрізняється від useResumeStreamingV2:

src/hooks/useJsonPatchStream.ts — generic hook

useResumeStreamingV2 useJsonPatchStream
Стейт Глобальний Zustand useAnalysisStore | Локальний useReducer
Auth useAuthStore хардкодений | buildHeaders: () => HeadersInit — consumer надає
Toast Вбудовані i18n тости | onError callback — consumer вирішує
URL Захардкоджений шаблон /resume/${jobId}/result-stream | url: string | null — будь-який ендпоінт
Request body { lastEventId } або {} | buildBody(lastEventId) або дефолт
Fatal errors disposedRef по retryable === false | + isFatalError(code) для кастомних кодів

Приклад використання для нового стріму:

```

const { data, status, isProcessing, retry } = useJsonPatchStream<InterviewAnalysis>({
  url: jobId ? `/api/interview/${jobId}/result-stream` : null,
  storageKey: jobId ? `interview-stream-${jobId}` : null,
  buildHeaders: () => ({
    Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
  }),
  isFatalError: (code) => ['NOT_FOUND', 'UNAUTHORIZED'].includes(code),
  onError: ({ message }) => toast.error(message),
});
```
