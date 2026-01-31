Так, **TanStack Query (React Query)** вміє працювати з Server Actions, але є **два критичних архітектурних нюанси**, про які мовчать у туторіалах.

### 1. Чи працює це технічно?

Так. Server Action — це просто асинхронна функція, що повертає Promise. Для TanStack Query це нічим не відрізняється від звичайного fetch.

```typescript
// actions.ts (Server)
'use server';
export async function getUsers() {
  // DB logic
  return db.users.findMany();
}

// ClientComponent.tsx (Client)
('use client');
import { useQuery } from '@tanstack/react-query';
import { getUsers } from './actions';

export function UserList() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(), // Виклик Server Action напряму
  });
}
```

---

### 2. Проблема з AbortController (Скасування запитів) ⚠️

Ось тут "собака зарита".

У класичному `fetch` ми робимо так:

```typescript
queryFn: ({ signal }) => fetch('/api', { signal }); // ✅ Працює, скасовує запит на сервері
```

З Server Actions це **НЕ ПРАЦЮЄ** напряму, тому що:

1. **Серіалізація:** Аргументи, що передаються в Server Action, мають бути серіалізовані (Next.js "boundary"). Об'єкт `AbortSignal` **не серіалізується**. Ви отримаєте помилку, якщо спробуєте передати `signal` аргументом: `Error: Only plain objects can be passed to Client Components`.
2. **POST only:** Всі Server Actions працюють через метод `POST`.

**Що відбувається при скасуванні (наприклад, перехід на іншу сторінку)?**

1. TanStack Query позначає запит як "Cancelled" у своєму стейті (UI не чекає відповіді).
2. Браузер обриває HTTP запит до Next.js сервера.
3. **АЛЕ:** Сама функція на сервері (Node.js runtime) може продовжити виконання до кінця, якщо Next.js не детектує обрив з'єднання миттєво (залежить від рантайма і деплоя). Ви не можете "прокинути" сигнал всередину БД, щоб скасувати довгий SQL-запит.

### Architectural Best Practice

Використання Server Actions у `useQuery` (для читання даних) вважається **Anti-Pattern** у великих системах, хоча і дозволено.

**Чому краще використовувати Route Handlers (GET API) для queries:**

1. **HTTP Semantics:** Server Actions — це завжди `POST`. Це вбиває HTTP-кешування браузера та CDN.
2. **AbortSignal:** У Route Handler ви отримуєте `request.signal` автоматично і можете скасувати запит до БД.
3. **Deduplication:** Next.js краще дедуплікує GET запити (`fetch`), ніж виклики Server Actions.

### Рекомендоване рішення (Hybrid Approach)

Використовуйте **Server Actions для Мутацій**, а **API Routes для Queries**.

**Для мутацій (ідеально):**

```typescript
const mutation = useMutation({
  mutationFn: (newData) => createUserAction(newData), // Server Action
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});
```

**Для складних Queries (якщо треба AbortController):**
Краще написати звичайний Route Handler (`app/api/users/route.ts`) і фетчити його.

Якщо ж ви все-таки хочете використовувати Server Actions для читання (бо це зручно і типи шаряться):

```typescript
// Можна, але з розумінням, що "справжнього" server-side cancellation не буде
useQuery({
  queryKey: ['data'],
  queryFn: async ({ signal }) => {
    // Ми не можемо передати signal, тому просто викликаємо
    // Якщо компонент розмонтується, Query проігнорує результат,
    // але сервер відпрацює вхолосту.
    return myServerAction();
  },
});
```
