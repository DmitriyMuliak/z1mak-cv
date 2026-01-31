# Progressive Enhancement Form

## UseActionState

Якщо ми хочемо досягти справжнього **Graceful Degradation** (Progressive Enhancement), щоб форма працювала навіть коли JS ще не завантажився (гідрація не пройшла) або впав з помилкою, ми **зобов'язані** використовувати атрибут `action`.

### У чому конфлікт?

1. **HTML/React `action`:** хоче відправити нативний `FormData` на сервер.
2. **RHF `onSubmit`:** хоче зробити `event.preventDefault()`, провалідувати дані на клієнті, і тільки потім щось зробити.

### Як це подружити (Best Practice)

Щоб працювало і "без JS" (нативно), і "з JS" (клієнтська валідація + SPA перехід), використовуємо гібридний підхід:

1. Передаємо `action={formAction}` у форму (для fallback).
2. Передаємо `onSubmit` для перехоплення керування, коли JS активний.

Ось виправлений, **архітектурно правильний код**:

```typescript
// src/features/auth/components/login-form.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { loginAction } from '@/actions/auth';
import { LoginSchema, type LoginInput } from '@/schema/auth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setError,
  } = useForm<LoginInput>({
    resolver: valibotResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    // Важливо: mode 'onTouched' або 'onChange' для кращого UX,
    // бо submit ми перехоплюємо
    mode: 'onTouched',
  });

  // Синхронізація серверних помилок
  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, message]) => {
        setError(key as keyof LoginInput, { type: 'server', message: message as string });
      });
    }
    if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, setError]);

  const onValidSubmit = (data: LoginInput) => {
    // Цей код виконається ТІЛЬКИ якщо клієнтська валідація пройшла успішно.
    // Ми формуємо FormData вручну, тому що RHF працює з JSON об'єктом data.
    const formData = new FormData();
    // Важливо: append саме тих ключів, які чекає бекенд
    formData.append('email', data.email);
    formData.append('password', data.password);

    // Викликаємо Server Action через хук (це запустить startTransition під капотом)
    formAction(formData);
  };

  return (
    <form
      // 1. Fallback для No-JS: браузер відправить POST на сервер
      action={formAction}
      // 2. Progressive Enhancement: якщо JS є, RHF перехопить сабміт,
      //    зробить preventDefault, провалідує, і якщо ОК - викличе onValidSubmit
      onSubmit={(evt) => {
        // handleSubmit повертає функцію, яка обробляє подію
        handleSubmit(onValidSubmit)(evt);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Input
          // RHF register автоматично додає name="email",
          // що критично для роботи без JS (SSR рендерить атрибут name)
          {...register('email')}
          placeholder="email@example.com"
          // disabled при сабміті (isPending з useActionState)
          disabled={isPending}
          autoComplete="email"
        />
        {formErrors.email && (
          <p className="text-sm text-destructive">{formErrors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          {...register('password')}
          type="password"
          disabled={isPending}
          autoComplete="current-password"
        />
        {formErrors.password && (
          <p className="text-sm text-destructive">{formErrors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}

```

### Чому це працює:

1. **JS OFF:** Браузер ігнорує `onSubmit`. Користувач тисне Enter -> спрацьовує атрибут `action`. Дані летять на сервер як `FormData`. `useActionState` на сервері це обробляє. Сторінка перезавантажується з новим станом (SSR).

- _Важливо:_ `register('email')` додає `name="email"` ще під час SSR рендеру, тому інпути мають правильні імена для нативного POST запиту.

2. **JS ON:**

- Спрацьовує `onSubmit`.
- `handleSubmit` (від RHF) викликає `event.preventDefault()`. Нативний `action` скасовується.
- RHF валідує поля.
- Якщо є помилки -> показує їх (запит на сервер не йде).
- Якщо все ОК -> викликається `onValidSubmit` -> ми вручну викликаємо `formAction(formData)`.

---

## useActionState + next-safe-action(or custom createServerAction)

`next-safe-action` — це бібліотека-обгортка (wrapper) для Server Actions у Next.js. Вона вирішує головну проблему "сирих" екшнів: **Boilerplate code**.

Без неї у кожному Server Action тобі доводиться писати:

1. `try/catch` для обробки помилок.
2. `schema.parse(data)` для валідації вхідних даних.
3. Перевірку авторизації (middleware logic).
4. Форматування відповіді у єдиний інтерфейс `{ success, error, data }`.

`next-safe-action` робить це декларативно.

Для **Production** архітектури це must-have.

Ось як це виглядає на практиці в твоєму стеку (Valibot + React 19).

### 1. Налаштування клієнта (Infrastructure Layer)

Спочатку створюємо базовий інстанс, який містить логіку обробки помилок та middleware.

```typescript
// src/lib/safe-action.ts
import { createSafeActionClient } from 'next-safe-action';
import { valibotAdapter } from 'next-safe-action/adapters/valibot';

export const actionClient = createSafeActionClient({
  // Підключаємо Valibot адаптер
  validationAdapter: valibotAdapter(),

  // Глобальна обробка помилок (щоб не крешити клієнт 500-ками)
  handleServerError(e) {
    console.error('Action error:', e);
    return 'Something went wrong. Please try again later.';
  },
});

// Auth Middleware example
export const authActionClient = actionClient.use(async ({ next, ctx }) => {
  // Тут перевірка сесії supabase
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) throw new Error("Unauthorized");

  return next({ ctx: { userId: 'user_123' } });
});
```

### 2. Створення Server Action (Business Logic Layer)

Тепер екшн стає чистим. Ніяких `try/catch` чи ручного парсингу.

```typescript
// src/actions/auth.ts
'use server';

import { actionClient } from '@/lib/safe-action';
import { LoginSchema } from '@/schema/auth';

// .schema() автоматично валідує вхідні дані
// Якщо дані не валідні -> action не запуститься, повернеться validationErrors
export const loginAction = actionClient
  .schema(LoginSchema)
  .action(async ({ parsedInput: { email, password }, ctx }) => {
    // Тут тільки бізнес логіка
    // const { error } = await supabase.auth.signInWithPassword(...)

    if (password !== 'secret') {
      // Можна кидати помилки, client їх відловить
      throw new Error('Invalid credentials');
    }

    return { success: true, userId: '123' };
  });
```

### 3. Інтеграція з UI (Presentation Layer)

Тут є нюанс. `next-safe-action` повертає об'єкт специфічної структури: `{ data, serverError, validationErrors }`. Нам треба адаптувати це під `useActionState`.

```typescript
// src/features/auth/components/login-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { loginAction } from '@/actions/auth';
import { LoginSchema, type LoginInput } from '@/schema/auth';
import { toast } from 'sonner';
// ... imports UI

export function LoginForm() {
  // next-safe-action сумісний з useActionState
  // Але state тепер має структуру SafeActionResult
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: valibotResolver(LoginSchema),
    mode: 'onTouched',
  });

  // Обробка результату від next-safe-action
  useEffect(() => {
    // 1. Validation Errors (якщо сервер відхилив дані)
    if (state?.validationErrors) {
      // next-safe-action повертає flat структуру помилок
      Object.entries(state.validationErrors).forEach(([key, errs]) => {
        // errs може бути масивом string
        const message = Array.isArray(errs) ? errs[0] : errs;
        if (message) setError(key as keyof LoginInput, { message: message as string });
      });
    }

    // 2. Server/Business Errors (throw new Error або handleServerError)
    if (state?.serverError) {
      toast.error(state.serverError);
    }

    // 3. Success
    if (state?.data?.success) {
      toast.success('Welcome back!');
    }
  }, [state, setError]);

  const onValidSubmit = (data: LoginInput) => {
    // next-safe-action розуміє звичайні об'єкти, але useActionState вимагає
    // або FormData, або щоб ми біндили аргументи.
    // Найпростіший шлях для React 19 + next-safe-action:

    // Варіант А (якщо action чекає JSON):
    // formAction(data); // Це працюватиме тільки якщо ми обгорнемо action

    // Варіант Б (Hybrid, як ми обговорювали):
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formAction(formData);
    // *Примітка: actionClient треба налаштувати на прийом FormData
    // або використати `next-safe-action/hooks` (useAction),
    // але ми хочемо нативний useActionState.
  };

  // ... JSX (форма) такий самий
}
```

### Рекомендація Архітектора

Якщо ти хочеш використовувати `next-safe-action` разом з нативним `useActionState` та `FormData` (для graceful degradation), тобі доведеться написати невелику утиліту-прокладку, бо `next-safe-action` за замовчуванням очікує JSON, а `useActionState` з формою передає `FormData`.

**Чи варто воно того?**
Так. Безпека типів і централізована обробка помилок критичні для Enterprise.

## Біндинг аргументів (Argument Binding)

**Біндинг аргументів (Argument Binding)** — це техніка використання методу `.bind()`, щоб створити нову версію функції із **заздалегідь зафіксованими (pre-filled) аргументами**.

У контексті **Server Actions** та **React 19**, це спосіб передати дані в Action без використання `<input type="hidden" />` і без брудних хаків з `FormData`.

### Як це працює технічно

React очікує, що Server Action, який передається у `action` проп форми або `useActionState`, має сигнатуру:
`(prevState, formData) => newState`.

Але часто тобі треба передати `userId` або `productId`, який вже є у компоненті.

#### 1. Без біндингу (Anti-pattern з Hidden Input)

Ти змушений пхати дані у DOM, що небезпечно (можна змінити через DevTools) і незручно.

```tsx
// Server Action
async function deleteProduct(prevState: any, formData: FormData) {
  const id = formData.get('id'); // Отримуємо з форми
  // ... delete logic
}

// Component
<form action={deleteProduct}>
  <input type="hidden" name="id" value={product.id} /> {/* ❌ Брудний код */}
  <button type="submit">Delete</button>
</form>;
```

#### 2. З біндингом (Best Practice)

Ти створюєш "спеціалізовану" функцію для конкретного продукту.

```tsx
// Server Action
// Ми змінили сигнатуру: id йде першим!
async function deleteProduct(id: string, prevState: any, formData: FormData) {
  // id приходить як аргумент, а не з formData
  await db.delete(id);
}

// Component
export function ProductItem({ id }: { id: string }) {
  // ✅ Ми "прив'язуємо" id до функції.
  // null - це контекст this (для Server Actions не важливий).
  // id - це перший аргумент, який зафіксується.
  const deleteThisProduct = deleteProduct.bind(null, id);

  return (
    <form action={deleteThisProduct}>
      <button type="submit">Delete</button>
    </form>
  );
}
```

### Чому це важливо для `next-safe-action`?

`next-safe-action` очікує типізований об'єкт, а `useActionState` (якщо використовувати його з формою) пхає `FormData`.

Щоб їх подружити, ти можеш "забіндити" об'єкт з даними, якщо викликаєш екшн не через форму, а програмно, або використовувати спеціальний хук `useAction` від бібліотеки.

Але у контексті **чистого React 19**, біндинг — це основний механізм передачі контексту (ID, Slug, Type) у серверну функцію.

## Validation state and Disabling submit button (React hook form)

### Моди валідації (mode)

- **onSubmit** (за замовч.) – перевірка тільки при сабміті; **isValid** до сабміту завжди **false**.
- **onBlur** – поле валідуюється після втрати фокуса; **isValid** стане true, коли всі торкнуті поля без помилок.
- **onChange** / onChangeWithSubmit – перевірка на кожну зміну; **isValid** оновлюється в реальному часі.
- **onTouched** / all – валідуює після першого торкання (onTouched) або всі події (all).
- **reValidateMode** визначає, коли перевіряти поле вдруге (наприклад, після виправлення).

### Як працює formState.isValid

- Значення залежить від mode. У onSubmit він лишається **false**, поки не було сабміту.
- У **onBlur/onChange** він стає true, коли всі поля, що вже валідовані (або всі поля при criteriaMode='all'), не мають помилок.
- **isValid** обчислюється тільки коли **criteriaMode** та mode дозволяють; інакше може знаходитись у початковому **false**.

### Альтернатива: Object.keys(formState.errors).length > 0

- Дивиться лише на наявні помилки в **errors**.
- На відміну від **isValid**, не вимагає попереднього сабміту/взаємодії; якщо жодне поле ще не валідоване, **errors** порожній, тож ви отримаєте **false** (тобто “форма валідна”), і кнопка може стати активною одразу.
- Добре підходить, коли хочете не блокувати кнопку на старті.

### Рекомендації для isFormInvalid

- Якщо хочете блокувати кнопку до будь-якої взаємодії → використовувати **!formState.isValid** і mode: **'onChange' | 'onBlur'**.
  Якщо хочете кнопку активною одразу, але блокувати при реальних помилках → **Object.keys(errors).length > 0.**
- Компроміс: **const isFormInvalid = Object.keys(errors).length > 0 && (formState.isDirty || formState.isSubmitted);** — блокує лише після першої взаємодії.

### Різниця поведінки isValid - прикдад

```typescript
const form = useForm<SendToAnalyzeFEType>({
  resolver: localizedValibotResolver(dynamicSchema, tv),
  mode: 'onSubmit',
  defaultValues: { cvText: '', jobText: '', jobFile: [], cvFile: [] },
});

та;

const form = useForm<ContactSchemaFEType>({
  resolver: localizedValibotResolver(ContactSchemaFE, tv),
  mode: 'onBlur',
  defaultValues: { name: '', email: '', message: '', files: [], recaptchaToken: null },
});

const { isValid } = form.formState;
```

### Головна різниця — режим валідації й початковий стан formState.isValid.

#### SendToAnalyzeForm (mode: 'onSubmit')

- Валідація тригериться лише під час сабміту. До першого сабміту **formState.isValid** завжди **false**, навіть якщо всі поля порожні/валідні.
- Добре підходить, коли не хочете блокувати користувача підказками/помилками до натискання “Send”.

#### ContactForm (mode: 'onBlur')

- Поле валідовується, коли втрачає фокус; **isValid** стане true, щойно всі вже-торкнуті поля пройдуть перевірку (і може повернутися в **false**, якщо з’являться нові помилки).
- Підходить, коли хочете показувати помилки одразу після роботи з полем і/або вмикати кнопку тільки після коректного заповнення.

#### Вплив на **isValid**

- В onSubmit — **isValid** не оновлюється до сабміту (початкове **false**).
- В onBlur — оновлюється після взаємодії з полями; може стати true ще до сабміту, якщо користувач усе заповнив правильно.
- Тому одна й та сама логіка **const { isValid } = form.formState;** поводиться по-різному: у onSubmit кнопка, що чекає **isValid** === true, лишиться disabled до сабміту; у onBlur може активуватись раніше.

### У чому різниця між form.watch('files') та useWatch({ control, name: 'files' })

**form.watch('files')**

- Метод інстансу **useForm**. Викликається у будь-якому місці, повертає значення на поточний момент.
- Не створює React‑підписки сам по собі: щоб компонент реагував на зміни, ти маєш викликати його всередині рендера (або вручну тригерити оновлення).
- Зручний для одноразового зчитування або в не‑React коді.

**useWatch({ control, name: 'files' })**

- Хук від RHF. Підписує компонент на зміни поля й викликає ререндер щоразу, коли **files** змінюється.
- Працює без виклику **form.watch** щоразу; оптимальніший і декларативний для деривацій стану в UI.
- Потрібен **control** (або **useFormContext** всередині форми).

Практично:

- якщо треба, щоб компонент автоматично оновлювався при зміні **files**, використовуй **useWatch**;
- якщо просто треба поточне значення разово — **form.watch**.
