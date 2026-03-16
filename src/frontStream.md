# Frontend Integration: `POST /resume/:id/result-stream`

## Встановлення

```bash
npm install @microsoft/fetch-event-source fast-json-patch
```

---

## Як це працює

Один endpoint повертає все — фінальний результат, активний стрім або стан черги. Окремий pre-check через `/status` перед підключенням не потрібен.

```
POST /resume/{jobId}/result-stream
Authorization: Bearer <token>
Content-Type: application/json

{ "lastEventId": "1234567890-0" }  ← опціонально, для відновлення після розриву
```

> Браузерний `EventSource` не підтримує `POST` і кастомні headers — використовуйте `@microsoft/fetch-event-source`.

---

## Послідовність events

### Нове підключення — job активний

```
snapshot { status:'in_progress', content: { overallAnalysis:{...} } }  ← агрегат до моменту підключення
patch    { ops: [{op:'add', path:'/quantitativeMetrics', value:{...}}] }
patch    { ops: [{op:'add', path:'/detailedSkillAnalysis', value:{...}}] }
...
done     { status:'completed', usedModel:'...', finishedAt:'...' }
```

### Нове підключення — job вже завершений

```
snapshot { status:'completed', content: { ...повний об'єкт... } }
done     { status:'completed', usedModel:'...', finishedAt:'...' }
```

### Нове підключення — job у черзі

```
snapshot { status:'queued', content: null }   ← з'єднання закривається, retry: 5000ms
```

### Reconnect з `lastEventId`

```
patch    { ops: [...пропущені events починаючи з lastEventId...] }
...
done     { status:'completed' }
```

---

## TypeScript типи

```ts
type JobStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

// Payload для кожного SSE event
interface SnapshotPayload {
  content: AnalysisResult | null;
  status: JobStatus;
  code?: string;
  message?: string;
}

interface PatchPayload {
  ops: Array<{
    op: 'add' | 'replace' | 'remove';
    path: string; // JSON Pointer: "/overallAnalysis", "/quantitativeMetrics"
    value?: unknown;
  }>;
}

interface DonePayload {
  status: JobStatus;
  usedModel?: string;
  finishedAt?: string;
}

interface ErrorPayload {
  code: string;
  message: string;
  retryable?: boolean;
}

// Форма аналізу — заповнюється секція за секцією під час стріму
interface AnalysisResult {
  overallAnalysis?: {
    matchScore: number;
    independentCvScore: number;
    independentTechCvScore: number;
    candidateLevel: 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Principal';
    jobTargetLevel: 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Principal';
    levelMatch: boolean;
    suitabilitySummary: string;
    educationMatch: boolean;
    jobHoppingFlag: boolean;
  };
  quantitativeMetrics?: {
    totalYearsInCV: number;
    relevantYearsInCV: number;
    requiredYearsInJob: number;
    keySkillCoveragePercent: number;
    stackRecencyScore: number;
    softSkillsScore: number;
  };
  detailedSkillAnalysis?: {
    title: string;
    skills: Array<{
      skill: string;
      type: string;
      status: string;
      evidenceFromCV: string;
      confidenceScore: number;
    }>;
  };
  experienceRelevanceAnalysis?: {
    title: string;
    jobs: Array<{
      jobTitle: string;
      company: string;
      period: string;
      relevanceToRoleScore: number;
      comment: string;
    }>;
  };
  redFlagsAndConcerns?: {
    title: string;
    flags: Array<{ concern: string; details: string; severity: string }>;
  };
  suggestedInterviewQuestions?: {
    title: string;
    questions: Array<{ question: string; reason: string }>;
  };
  improvementComponents?: {
    summaryRewrite?: { suggestion: string; example: string };
    keywordOptimization?: { missingKeywords: string[]; suggestion: string };
    quantifyAchievements?: {
      targetSection: string;
      suggestion: string;
      examplesToImprove: string[];
    };
    removeIrrelevant?: { suggestion: string };
  };
  metadata?: {
    isValidCv: boolean;
    isValidJobDescription: boolean;
    isJobDescriptionPresent: boolean;
  };
}
```

> Всі поля верхнього рівня — `optional`, бо під час стріму секції з'являються поступово. Не очікуйте що всі вони будуть присутні одночасно.

---

## SSE events — контракт

### `snapshot` — повний поточний стан

```ts
// Дія: state = data.content ?? {}
```

| Поле      | Тип                      | Опис                                         |
| --------- | ------------------------ | -------------------------------------------- |
| `content` | `AnalysisResult \| null` | Поточний стан. `null` якщо job ще не почався |
| `status`  | `JobStatus`              | Поточний статус job                          |
| `code`    | `string?`                | Тільки при `status: 'failed'`                |
| `message` | `string?`                | Тільки при `status: 'failed'`                |

> ⚠️ `content` — це **об'єкт**, не рядок. `JSON.parse()` не потрібен.

---

### `patch` — дельта-оновлення

```ts
// Дія: state = applyPatch(state, data.ops, false, false).newDocument
```

| Поле  | Тип           | Опис                                             |
| ----- | ------------- | ------------------------------------------------ |
| `ops` | `Operation[]` | RFC 6902 патчі. Зазвичай один `add` op на секцію |

Patch приходить коли AI завершує генерацію чергової секції. Типові paths:

```
/overallAnalysis
/quantitativeMetrics
/detailedSkillAnalysis
/experienceRelevanceAnalysis
/redFlagsAndConcerns
/suggestedInterviewQuestions
/improvementComponents
/metadata
```

Два аргументи `false` у `applyPatch(state, ops, false, false)`:

- перший `false` — не мутувати `state` in-place, повернути новий об'єкт
- другий `false` — не зберігати reverse patches (не потрібно для UI)

---

### `done` — стрім завершено

```ts
// Дія: зупинити spinner, прибрати курсор з sessionStorage
```

| Поле         | Тип                       | Опис             |
| ------------ | ------------------------- | ---------------- |
| `status`     | `'completed' \| 'failed'` | Фінальний статус |
| `usedModel`  | `string?`                 | Назва AI моделі  |
| `finishedAt` | `string?`                 | ISO timestamp    |

---

### `error` — помилка стріму

```ts
// Дія: показати помилку. Якщо retryable: false — зупинити reconnect
```

| Поле        | Тип        | Опис                                               |
| ----------- | ---------- | -------------------------------------------------- |
| `code`      | `string`   | `NOT_FOUND`, `SERVER_ERROR`, `PROVIDER_ERROR`, ... |
| `message`   | `string`   | Human-readable опис                                |
| `retryable` | `boolean?` | `false` → не reconnectити                          |

---

## Реалізація

### Базова (vanilla TS)

```ts
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { applyPatch } from 'fast-json-patch';

let state: AnalysisResult = {};

async function connectToStream(jobId: string, token: string) {
  const savedId = sessionStorage.getItem(`sse_cursor_${jobId}`);

  await fetchEventSource(`${API_URL}/resume/${jobId}/result-stream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(savedId ? { lastEventId: savedId } : {}),

    onmessage(ev) {
      if (ev.id && ev.id !== '0') {
        sessionStorage.setItem(`sse_cursor_${jobId}`, ev.id);
      }

      const data = JSON.parse(ev.data);

      switch (ev.event) {
        case 'snapshot': {
          const payload = data as SnapshotPayload;
          state = (payload.content ?? {}) as AnalysisResult;
          updateUI(state, payload.status);
          if (payload.status === 'failed') {
            showError(payload.code ?? 'FAILED', payload.message ?? 'Analysis failed');
          }
          break;
        }

        case 'patch': {
          const payload = data as PatchPayload;
          state = applyPatch(state, payload.ops, false, false).newDocument as AnalysisResult;
          updateUI(state, 'in_progress');
          break;
        }

        case 'done': {
          const payload = data as DonePayload;
          onCompleted(payload);
          sessionStorage.removeItem(`sse_cursor_${jobId}`);
          break;
        }

        case 'error': {
          const payload = data as ErrorPayload;
          showError(payload.code, payload.message);
          if (payload.retryable === false) throw new Error('NON_RETRYABLE');
          break;
        }
      }
    },

    onerror(err) {
      if (err.message === 'NON_RETRYABLE') throw err;
      // інакше fetch-event-source виконає reconnect автоматично
    },
  });
}
```

### Zustand store

```ts
import { create } from 'zustand';
import { applyPatch } from 'fast-json-patch';
import type { Operation } from 'fast-json-patch';

interface AnalysisStore {
  data: AnalysisResult;
  status: JobStatus;
  usedModel: string | null;
  applyPatches: (ops: Operation[]) => void;
  setSnapshot: (content: AnalysisResult | null, status: JobStatus) => void;
  setDone: (status: JobStatus, usedModel?: string) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  data: {},
  status: 'queued',
  usedModel: null,

  applyPatches: (ops) =>
    set({ data: applyPatch(get().data, ops, false, false).newDocument as AnalysisResult }),

  setSnapshot: (content, status) => set({ data: (content ?? {}) as AnalysisResult, status }),

  setDone: (status, usedModel) => set({ status, usedModel: usedModel ?? null }),

  reset: () => set({ data: {}, status: 'queued', usedModel: null }),
}));
```

### React — гранульований ре-рендер

Кожен компонент підписується тільки на своє поле — ре-рендериться тільки тоді, коли саме ця секція змінилась:

```tsx
// Рендериться коли приходить patch /overallAnalysis
function MatchScore() {
  const score = useAnalysisStore((s) => s.data.overallAnalysis?.matchScore);
  return <div>{score ?? <Skeleton />}</div>;
}

// Рендериться коли приходить patch /detailedSkillAnalysis
function SkillsList() {
  const skills = useAnalysisStore((s) => s.data.detailedSkillAnalysis?.skills);
  if (!skills) return <Skeleton />;
  return (
    <ul>
      {skills.map((s) => (
        <li key={s.skill}>{s.skill}</li>
      ))}
    </ul>
  );
}

// Статус — окрема підписка, не залежить від даних
function StatusBadge() {
  const status = useAnalysisStore((s) => s.status);
  return <Badge variant={status}>{status}</Badge>;
}
```

---

## Управління курсором (`lastEventId`)

```ts
// Зберегти після кожного event
if (ev.id && ev.id !== '0') {
  sessionStorage.setItem(`sse_cursor_${jobId}`, ev.id);
}

// Прочитати при підключенні
const savedId = sessionStorage.getItem(`sse_cursor_${jobId}`);
body: JSON.stringify(savedId ? { lastEventId: savedId } : {});

// Видалити коли job завершено
sessionStorage.removeItem(`sse_cursor_${jobId}`);
```

**Коли скидати стан:**

- Якщо `lastEventId` відсутній → `snapshot` замінить весь стан → OK
- Якщо `lastEventId` є → patches накладаються поверх → стан має зберігатись між reconnect-ами
- При старті нового job → обов'язково викликати `reset()` і видалити курсор

---

## Черга (Adaptive Polling)

Якщо job ще у черзі, сервер надсилає `snapshot { status:'queued', content:null }` з директивою `retry: 5000` і закриває з'єднання. `fetch-event-source` автоматично повторить підключення через 5 секунд.

Рекомендований UI: показати "In queue..." і не рендерити skeleton для даних до першого `patch`.

---

## HTTP помилки (до SSE з'єднання)

| Код   | Причина                                  | Дія                                                    |
| ----- | ---------------------------------------- | ------------------------------------------------------ |
| `400` | Невалідний `lastEventId` або тіло запиту | Видалити курсор, підключитись заново без `lastEventId` |
| `401` | Прострочений або відсутній токен         | Оновити токен                                          |
| `404` | Job не існує                             | Показати помилку, не retry                             |
| `429` | Rate limit                               | Retry з затримкою                                      |
| `500` | Серверна помилка                         | Retry 1-2 рази                                         |

---

## Таблиця статусів

| `status`      | UI                                    | Наступний крок                   |
| ------------- | ------------------------------------- | -------------------------------- |
| `queued`      | "In queue..."                         | Чекати reconnect через 5s        |
| `in_progress` | Показувати секції по мірі надходження | Чекати `patch` + `done`          |
| `completed`   | Фінальний результат                   | Прибрати курсор                  |
| `failed`      | Показати `code` / `message`           | Не retry якщо `retryable: false` |
