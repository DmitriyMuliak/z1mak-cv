## Брендування типів (Branded Types або Nominal Typing) — це архітектурний прийом, який дозволяє зробити технічно однакові типи (наприклад, дві різні string) несумісними між собою на рівні компілятора.

```
// Створюємо бренд
declare const brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

// Універсальний тип для ID
export type Id<T extends string> = Brand<string, T>;
```

```
import { Database } from './database.types';

type RawAnalysis = Database['public']['Tables']['cv_analyzes']['Row'];

// Брендуємо конкретні поля
export interface CvAnalysis extends Omit<RawAnalysis, 'id' | 'user_id' | 'resume_id'> {
  id: Id<'cv_analyzes'>;
  user_id: Id<'users'>;
  resume_id: Id<'resumes'>;
}

// Тепер спробуємо використати
const analysisId = 'abc-123' as Id<'cv_analyzes'>;
const userId = 'user-999' as Id<'users'>;

function getAnalysis(id: Id<'cv_analyzes'>) { /* ... */ }

getAnalysis(analysisId); // OK
// getAnalysis(userId);   // Помилка: Id<'users'> не підходить до Id<'cv_analyzes'>

```

```
const { data } = await supabase
  .from('cv_analyzes')
  .select('*')
  .returns<CvAnalysis[]>(); // Використовуємо наш брендований тип
```

## Парсинг рядка: TypeScript буквально "розрізає" ваш рядок за комами та пробілами, використовуючи рекурсивні типи.

Ось спрощена версія того, як Supabase SDK розбирає ваш рядок .select('id, name').

1. Базовий механізм: Спліт рядка (Split)
   Спочатку нам потрібен тип, який перетворює рядок 'a, b, c' у масив типів ['a', 'b', 'c'].

```
type Trim<T extends string> = T extends ` ${infer Rest}` | `${infer Rest} `
  ? Trim<Rest>
  : T;

type Split<S extends string> = S extends `${infer T},${infer U}`
  ? [Trim<T>, ...Split<U>]
  : [Trim<S>];

// Тест:
type Result = Split<"id,  status, created_at">;
// Отримаємо: ["id", "status", "created_at"]
```

2. Валідація проти ключів об'єкта
   Тепер ми беремо цей масив і перевіряємо, чи є кожен його елемент ключем нашої таблиці.

```
type ValidateKeys<T, Keys extends string[]> = {
  [K in keyof Keys]: Keys[K] extends keyof T
    ? Keys[K]
    : `Error: column '${Keys[K]}' does not exist`
};

// Приклад з вашою таблицею:
type CvRow = { id: string; status: string; created_at: string };
type Check = ValidateKeys<CvRow, Split<"id, sda">>;
// Отримаємо: ["id", "Error: column 'sda' does not exist"]
```

3. Фінальний мапінг (The Magic Part)
   В Supabase SDK використовується логіка: якщо в масиві з'явилася "помилка", повернути спеціальний тип-попередження. Якщо все ок — сформувати об'єкт.

```
type ParseSelect<T, S extends string> =
  Split<S> extends infer K
    ? K extends string[]
      ? { [P in K[number]]: P extends keyof T ? T[P] : never }
      : never
    : never;

// Використання:
type MyResult = ParseSelect<CvRow, "id, status">;
// MyResult тепер: { id: string; status: string; }
```

## У TS є проблема з частковим виведеннямтипів типів

```
// Уявімо, що ми хочемо зафіксувати TCode вручну,
// а TData має автоматично вивестися з об'єкта payload

const createError = <TCode extends string, TData>(
  code: TCode,
  payload: TData
) => {
  return { code, payload, timestamp: Date.now() };
};

// ❌ ПРОБЛЕМА:
// Якщо ми хочемо явно вказати літеральний тип для Code, ми пишемо:
createError<'QUEUE_FULL', { size: number }>('QUEUE_FULL', { size: 10 });

// ❌ МИ НЕ МОЖЕМО ЗРОБИТИ ТАК:
// TypeScript видасть помилку, бо очікує 2 дженеріки, або 0.
// Він не може вивести TData, якщо TCode вказано явно.

createError<'QUEUE_FULL'>('QUEUE_FULL', { size: 10 });
```

- Це відома архітектурна дилема в TypeScript, яка називається **"Partial Type Argument Inference"** (часткове виведення типів).

TypeScript (на поточний момент) працює за принципом **"все або нічого"**: якщо ви явно передаєте хоча б один дженерік (`<T>`), вимикається автоматичне виведення типів для решти аргументів на основі значень.

Ось варіанти вирішення цієї проблеми для Production коду:

### 1. Currying — Розділення контексту

Це класичний патерн для бібліотек (наприклад, `redux-toolkit` або `zod`). Ви розбиваєте виклик на два етапи:

1. Перший фіксує тип ключа (`TCode`).
2. Другий використовує зафіксований `TCode` для валідації payload.

```typescript
// Definition
const createAction =
  <Code extends string>(code: Code) =>
  (payload: PayloadMap[Code]) => {
    /* implementation */
  };

// Usage
createAction('ANALYZE_CV')({ cvId: '123' }); // ✅ Тип payload підтягнувся сам
createAction('UNKNOWN')({}); // ❌ TS Error: 'UNKNOWN' not in PayloadMap
```

- **Плюси:** Ідеальне виведення типів.
- **Мінуси:** Синтаксис `()()` може виглядати незвично (`funky`) для новачків.

---

### 2. Mapped Types (Best Practice для 90% випадків)

Ви можете уникнути дублювання та дужок `()()`, якщо правильно зв'яжете аргументи через `keyof`. Вам **не потрібно** писати `action<'name'>`, TypeScript сам виведе літерал `'name'`, якщо ви визначите перший аргумент як `K extends keyof Map`.

```typescript
// 1. Map ваших типів
type ActionPayloads = {
  ANALYZE: { file: File };
  LOG_OUT: undefined;
};

// 2. Розумна функція
function dispatch<K extends keyof ActionPayloads>(type: K, payload: ActionPayloads[K]) {
  // ...
}

// 3. Usage - БЕЗ дублювання
dispatch('ANALYZE', { file: new File([], 'cv.pdf') }); // ✅ TS знає, що тут має бути file
dispatch('ANALYZE', { foo: 'bar' }); // ❌ Error
```

**Чому це працює:** Тут не треба писати `<'ANALYZE'>` явно. TS бачить рядок `'ANALYZE'`, звужує `K` до цього літералу і автоматично розуміє, яким має бути другий аргумент.

---

### 3. Discriminated Union (Найчистіший варіант для Actions)

Якщо це Server Actions або Redux-подібні події, найкраще приймати **один об'єкт**. Це стандарт індустрії.

```typescript
type Action =
  | { type: 'ANALYZE'; payload: { file: File } }
  | { type: 'RESET'; payload?: never };

function dispatch(action: Action) { ... }

// Usage
dispatch({ type: 'ANALYZE', payload: { ... } }); // ✅ Автокомпліт працює після вводу type

```

### 4. The Dummy Class Hack

Це технічний "hack" (workaround). Ви створюєте клас лише для того, щоб передати один дженерік у конструктор, а інший — у метод. В сучасному TS практично не використовується, бо Currying простіший.

### Якщо вам не потрібно фіксувати якусь частину типів ви можете просто передати Dummy-аргумент.

### Dummy-аргумент (Object Param):

Ви передаєте все в одному об'єкті { code: '404', data: { id: 1 } }. TypeScript виводить обидва типи одночасно, бо вони знаходяться в одному "контейнері".

```typescript
function handleError<TCode extends string, TData>(config: { code: TCode; data: TData }) {
  return config;
}

// Працює ідеально, бо TS виводить обидва типи одночасно з одного об'єкта
handleError({ code: 'QUEUE_FULL', data: { size: 10 } });
```

### Вердикт архітектора

1. Якщо ви будуєте **Builder** або **Factory** (наприклад, створюєте ендпоінти) — використовуйте **Currying** (`action('name')(config)`).
2. Якщо це просто виклик функції (як у вашому випадку з `analyzeResume` чи обробкою помилок) — використовуйте **варіант №2 (Mapped Types)**. Це дозволяє писати `handleError('QUEUE_FULL', { ... })` без зайвих дужок і без дублювання дженеріків.
