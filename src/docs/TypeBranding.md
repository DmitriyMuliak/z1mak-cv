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
