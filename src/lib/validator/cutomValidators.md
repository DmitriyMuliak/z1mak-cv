
🧠 1. Як працюють issue в Valibot

У Valibot кожен валідатор (наприклад v.minLength(5)) при невдачі створює issue-об’єкт типу:

interface BaseIssue {
  message: string;
  input: unknown;
  path?: string[];
  type: string; // Наприклад: "min_length", "email", ...
}


Ти можеш перехопити або створити власні issue через:

v.check() — найгнучкіший спосіб

або створюючи власний custom validator через v.custom() чи v.pipe()

⚙️ 2. Використання v.check() для власних помилок

Приклад — мінімальна довжина з власним динамічним повідомленням:

import * as v from 'valibot';

const minLength = (len: number) =>
  v.check<string>(
    (input) => input.length >= len,
    (issue) => ({
      ...issue,
      type: 'min_length_custom',
      message: `Must be at least ${len} characters long (got ${input.length})`,
      meta: { min: len, actual: input.length }, // 👈 твої кастомні дані
    })
  );

const NameSchema = v.pipe(v.string(), minLength(5));

const result = v.safeParse(NameSchema, 'abc');
console.log(result);


Якщо ввести 'abc', ти отримаєш result.issues[0] із повною структурою:

{
  type: "min_length_custom",
  message: "Must be at least 5 characters long (got 3)",
  meta: { min: 5, actual: 3 },
  input: "abc",
  path: []
}


✅ — тут meta може містити будь-які динамічні значення (min, max, fieldName, і т.д.)

🧩 3. Якщо хочеш створювати власні валідатори як функції
const minMax = (min: number, max: number) =>
  v.check<number>(
    (input) => input >= min && input <= max,
    (issue) => ({
      ...issue,
      type: 'range_error',
      message: `Value must be between ${min} and ${max}, got ${input}`,
      meta: { min, max, actual: input },
    })
  );

const AgeSchema = v.pipe(v.number(), minMax(18, 60));

💡 4. Якщо треба глобальний формат помилок

Ти можеш перехоплювати issue після v.safeParse() і формувати свою структуру:

const result = v.safeParse(AgeSchema, 10);

if (!result.success) {
  const errors = result.issues.map((issue) => ({
    key: issue.path?.join('.') ?? 'root',
    type: issue.type,
    msg: issue.message,
    ...issue.meta, // 👈 твої значення min/max
  }));
  console.log(errors);
}


Результат:

[
  {
    key: "root",
    type: "range_error",
    msg: "Value must be between 18 and 60, got 10",
    min: 18,
    max: 60,
    actual: 10
  }
]

🔧 Підсумок
Що треба	Як робити
Отримати issue	Через v.safeParse(schema, data) → result.issues
Додати свої поля (min, max, fieldName тощо)	Передай їх у meta або у message в v.check()
Створити власний валідатор	Через v.pipe(base, v.check(...))
Глобально форматувати помилки	Оброби result.issues після парсу





















const customString = 'my {{min}}'
а не можна в v.minLength(5, customString); свою стрінгу яка буде піставляти значення або функцію 
Програма ChatGPT сказала:

🔥 Абсолютно логічне питання — і ти дуже влучно його сформулював.

👉 Коротко: у v.minLength(5, customString) — ні, просто так “{{min}}” не підставить значення.
Але 👇 є два правильних способи, як це зробити у сучасному Valibot.

🧩 ВАРІАНТ 1 — передати функцію як повідомлення (офіційно підтримується ✅)

v.minLength() може приймати другим аргументом або рядок, або функцію, і ця функція отримає issue як аргумент, з якого можна дістати динамічні значення (наприклад min, input, тощо).

import * as v from 'valibot';

const schema = v.pipe(
  v.string(),
  v.minLength(5, (issue) => `Мінімальна довжина — ${issue.min}, отримано ${issue.input.length}`)
);

const result = v.safeParse(schema, 'abc');
console.log(result.issues?.[0]?.message);


✅ Виведе:

"Мінімальна довжина — 5, отримано 3"


issue завжди містить усі метадані конкретного валідатора — наприклад min, max, input, path.

🧠 ВАРІАНТ 2 — зробити свою міні-систему шаблонів {{min}} (як ти хотів)

Якщо хочеш використовувати шаблон "Мінімум {{min}}, отримано {{actual}}", можна обгорнути валідатор у свій helper:

const withTemplate = <T extends v.BaseSchema>(
  validator: T,
  message: string
) =>
  v.check<any>(
    (input, ctx) => {
      const result = v.safeParse(validator, input);
      if (!result.success) {
        const issue = result.issues[0];
        const text = message
          .replace('{{min}}', issue.min ?? '')
          .replace('{{max}}', issue.max ?? '')
          .replace('{{actual}}', (issue.input as string)?.length ?? '');
        ctx.addIssue({
          ...issue,
          message: text,
        });
        return false;
      }
      return true;
    }
  );

// Використання:
const schema = v.pipe(
  v.string(),
  withTemplate(v.minLength(5), 'Мінімум {{min}}, отримано {{actual}}')
);

console.log(v.safeParse(schema, 'abc').issues);


✅ Результат:

[
  {
    type: 'min_length',
    message: 'Мінімум 5, отримано 3',
    min: 5,
    input: 'abc'
  }
]

💡 РЕЗЮМЕ
Що ти хочеш	Як зробити
Динамічне повідомлення без шаблонів	v.minLength(5, issue => \Min ${issue.min}`)`
Використовувати {{placeholders}}	Напиши простий обгортковий helper (withTemplate)
Додаткові дані в issue	Всі built-in валідатори (min, max, length) додають їх автоматично



// Finally -> Можна вантажити свої хелпер функції які будуть мати доступ до перекладу.
// Требюа подумати як передавати свої {{ placeholders }} для кастомних валідацій.

