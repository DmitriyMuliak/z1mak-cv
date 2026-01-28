## React Query + API Setvice

### Setup

```typescript
// lib/queryClient.ts
import { QueryClient, QueryFunctionContext } from '@tanstack/react-query';
import { apiService } from '@/services/api';

const defaultQueryFn = async ({ queryKey }: QueryFunctionContext) => {
  // queryKey в React Query - це завжди масив.
  // Домовимось про конвенцію: [URL, Params]
  const [url, params] = queryKey as [string, Record<string, unknown> | undefined];

  return apiService.get(url, params);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Дані вважаються свіжими 5 хв
    },
  },
});
```

### Component setup

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### Use Get Data

```typescript
import { useQuery } from '@tanstack/react-query';

const UserProfile = ({ userId }: { userId: number }) => {
  const { data, isPending, isError } = useQuery<User>({
    // Цей масив автоматично полетить у defaultQueryFn -> apiService.get('/users', { id: userId })
    queryKey: ['/users', { id: userId }],

    // enabled: false - якщо хочеш не робити запит, поки немає ID (аналог if в useEffect)
    enabled: !!userId,
  });

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return <div>{data.name}</div>;
};
```

### Use Mutations

```typescript
// features/users/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/api/service';
import { User } from '@/types';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const queryKey = ['/users'];

  return useMutation({
    // 1. Власне запит
    mutationFn: (newUser: Omit<User, 'id'>) => apiService.post<User>('/users', newUser),

    // 2. ОПТИМІСТИЧНЕ ОНОВЛЕННЯ (спрацьовує миттєво)
    onMutate: async (newUser) => {
      // А. Скасовуємо будь-які активні refetch, щоб вони не перезаписали наші зміни
      await queryClient.cancelQueries({ queryKey });

      // Б. Зберігаємо попередній стан (snapshot)
      const previousUsers = queryClient.getQueryData<User[]>(queryKey);

      // В. Оновлюємо кеш вручну
      queryClient.setQueryData<User[]>(queryKey, (old = []) => [
        ...old,
        // Створюємо тимчасовий об'єкт. ID можна згенерувати випадковий або temp-1
        { id: Math.random(), ...newUser, isOptimistic: true },
      ]);

      // Повертаємо контекст для можливого відкату
      return { previousUsers };
    },

    // 3. Якщо сталась помилка — відкочуємо зміни
    onError: (err, newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKey, context.previousUsers);
      }
    },

    // 4. Після завершення (успіх або помилка)
    onSettled: () => {
      // Тут ми вирішуємо: робити GET чи ні?
      // Best Practice: Зробити, щоб отримати справжній ID з бази даних.
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
```

### Domain Layer

Навіть використання useSWR або useQuery напряму в компонентах (View Layer) — це не ідеально для великих проектів. Створюй Custom Hooks (Domain Layer). Це інкапсулює ключі кешування.

```typescript
import useSWR from 'swr'; // або useQuery

export const useUser = (id: number) => {
  const { data, error, isLoading, mutate } = useSWR<User>(['/users', { id }]);

  return {
    user: data,
    isError: !!error,
    isLoading,
    refreshUser: mutate, // абстрагуємо метод оновлення
  };
};

const UserProfile = ({ id }) => {
  // Компонент взагалі не знає про URL, API чи бібліотеку SWR/ReactQuery
  const { user, isLoading } = useUser(id);

  if (isLoading) return <Loader />;
  return <div>{user?.name}</div>;
};
```

### Pooling

```typescript
useQuery({
  queryKey: ['/process-status'],
  queryFn: () => apiService.get(`/export/${id}`),
  refetchInterval: 2000,
  // Продовжувати навіть якщо вкладка не активна
  refetchIntervalInBackground: true,
  refetchInterval: (query) => {
    const currentStatus = query.state.data?.status;

    if (currentStatus === 'completed' || currentStatus === 'failed') {
      return false; // СТОП
    }

    return 1000; // Продовжуємо кожну 1000мс
  },
});
```

## Трансформація даних (Selectors)

В Redux ти робив: `API -> Reducer (змінює структуру) -> Store -> Component`.
В React Query ти робиш: `API -> Cache (зберігає як є) -> Select (трансформує для UI) -> Component`.

У `useQuery` є опція `select`. Це функція, яка приймає "сирі" дані з бекенду і повертає те, що потрібно компоненту (для таблиці, списку тощо).

**Важливо:** Ця функція використовує **мемоізацію**. Вона запуститься знову, тільки якщо змінилися дані (`data`) або змінилась сама функція трансформації.

#### Приклад: Підготовка даних для Таблиці

Уяви, що бекенд віддає складний JSON, а тобі для `<Table />` потрібен плоский масив.

```typescript
interface RawUser {
  id: number;
  attributes: {
    firstName: string;
    lastName: string;
    metadata: { lastLogin: string };
  };
}

interface TableRow {
  id: number;
  fullName: string;
  lastSeen: string;
}

const useUsersTable = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: apiService.getUsers,

    // ⚡️ ОСЬ ТВІЙ "REDUCER" / "SELECTOR"
    select: (data: RawUser[]): TableRow[] => {
      return data.map((user) => ({
        id: user.id,
        fullName: `${user.attributes.firstName} ${user.attributes.lastName}`,
        lastSeen: new Date(user.attributes.metadata.lastLogin).toLocaleDateString(),
      }));
    },
  });
};
```

Тепер компонент отримає вже **готовий** масив `TableRow[]`. Якщо компонент перерендериться з інших причин — `select` не буде перераховувати масив заново (стабільна посилання).

---

## Пагінація та списки

### А. Звичайна пагінація

Тобі не треба зберігати дані всіх сторінок в сторі. Ти зберігаєш в кеші кожну сторінку окремо під унікальним ключем `['users', page]`.

Щоб інтерфейс не "блимав" при переході (Loading...), використовується `placeholderData`.

```typescript
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ['users', page],
  queryFn: () => fetchUsers(page),
  // Залишає дані попередньої сторінки на екрані, поки вантажиться нова
  placeholderData: keepPreviousData,
});
```

### Б. Infinite Scroll (Load More)

Для цього є спеціальний хук **`useInfiniteQuery`**. Він сам керує масивом сторінок. Тобі не треба писати редюсер для конкатенації.

```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['users', 'infinite'],
  queryFn: ({ pageParam = 1 }) => fetchUsers(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
});

// data.pages — це масив масивів.
// Щоб отримати плоский список для рендеру:
const allUsers = data?.pages.flatMap((page) => page.users) ?? [];
```

---

## Тоді навіщо потрібен Zustand?

Ось тут діаграма показує різницю.

Ти використовуєш **Zustand** (або Context API) не для даних, а для **керування параметрами запиту**.

Ідеальна архітектура:

1. **Zustand:** Зберігає фільтри, сортування, номер сторінки, відкриті модалки.
2. **React Query:** Слухає зміни в Zustand і автоматично фетчить/кешує/трансформує дані.

**Приклад зв'язки (Best Practice):**

```typescript
// 1. Zustand Store: Тільки легковагові UI параметри
const useFiltersStore = create((set) => ({
  search: '',
  status: 'active',
  setSearch: (search) => set({ search }),
}));

// 2. React Query: Реагує на зміни
const useFilteredUsers = () => {
  // Дістаємо фільтри
  const { search, status } = useFiltersStore();

  return useQuery({
    // Ключ змінився -> React Query робить новий запит
    queryKey: ['users', { search, status }],
    queryFn: () => apiService.getUsers({ search, status }),

    // Трансформуємо під таблицю
    select: (data) => data.map((u) => ({ ...u, key: u.id })),
  });
};
```

### Висновок

1. **Для структури даних (Table, View Models):** Використовуй опцію `select` всередині `useQuery`. Це твій новий "selector/reducer".
2. **Для "склеювання" списків:** Використовуй `useInfiniteQuery`.
3. **Для стану UI (Фільтри, Таби, Pagination Index):** Використовуй **Zustand** або URL (search params).

Не дублюй дані відповіді сервера в Zustand. Це створить проблему синхронізації ("Two sources of truth"), від якої ми намагаємося втекти.

## Реалізація в Next.js (App Router) з TanStack Query

Server Component (app/users/page.tsx)

```typescript
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { getUsers } from '@/actions/getUsers';
import UserList from './user-list'; // Клієнтський компонент

export default async function UsersPage() {
  const queryClient = new QueryClient();

  // 1. Prefetch на сервері.
  // Зауваж: ми викликаємо серверну функцію напряму, без HTTP fetch
  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  // 2. Dehydrate state
  // Ми передаємо заморожений стан у HydrationBoundary
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 3. Рендеримо клієнтський компонент */}
      <UserList />
    </HydrationBoundary>
  );
}
```

Client Component (app/users/user-list.tsx)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/actions/getUsers';

export default function UserList() {
  // 4. useQuery зчитує дані з HydrationBoundary МИТТЄВО.
  // Запит на сервер НЕ полетить (status === 'success' одразу).
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

Це класична проблема "Double Fetch" (подвійного запиту) при SSR. Ти абсолютно правий: немає сенсу навантажувати сервер ще раз, якщо ми щойно отримали дані під час генерації HTML.

Щоб цього уникнути, ти **зобов'язаний** налаштувати `staleTime`. Це єдиний правильний спосіб сказати React Query: _"Ці дані, що прийшли з сервера, ще свіжі. Не чіпай їх певний час"_.

Ось 3 способи, як це зробити, від простого до глобального.

### Спосіб 1: Локальний `staleTime` (Найпростіший)

Просто додай `staleTime` у свій хук. Наприклад, 1 хвилина.

```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => getUsers(),
  // ВАЖЛИВО: Кажемо: "Вважай дані свіжими 1 хвилину"
  staleTime: 60 * 1000,
});
```

**Що відбудеться:**

1. Компонент маунтиться.
2. React Query бачить дані з HydrationBoundary.
3. Він дивиться на `staleTime`.
4. Він бачить, що дані були отримані на сервері 500мс тому (timestamp передається при гідрації).
5. `500ms < 1min` -> **Дані свіжі**.
6. **Фоновий запит НЕ запускається.**

### Спосіб 2: Глобальний `staleTime` (Best Practice)

Для більшості додатків `staleTime: 0` — це занадто агресивно. Зазвичай, дані не протухають миттєво.
Краще встановити дефолтне значення глобально (наприклад, 1 хвилина) при створенні клієнта.

**Файл: `providers.tsx` (або де ти створюєш QueryClient)**

```typescript
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // За замовчуванням всі запити вважаються свіжими 1 хвилину.
          // Це автоматично вирішує проблему подвійного фетчу для всього проекту.
          staleTime: 60 * 1000,

          // Опціонально: оновлювати дані, якщо юзер перемкнув вкладку, навіть якщо staleTime не вийшов?
          // Зазвичай краще false, якщо staleTime активний.
          refetchOnWindowFocus: false,
        },
      },
    }),
);
```

Якщо для якоїсь конкретної сторінки (наприклад, курсів валют) тобі треба миттєве оновлення, ти просто перевизначиш це локально: `useQuery({ ..., staleTime: 0 })`.

### Спосіб 3: `refetchOnMount: false` (Жорсткий метод)

Якщо ти **принципово** не хочеш використовувати `staleTime` (хоча я раджу саме його), ти можеш заборонити фетч при маунті.

```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => getUsers(),
  refetchOnMount: false,
});
```

**Мінус цього підходу:**
Якщо користувач піде зі сторінки і повернеться (компонент розмонтується і змонтується знову), запит **не відбудеться**, навіть якщо дані вже дуже старі. Він відбудеться тільки якщо ти натиснеш кнопку, яка викличе `refetch`, або спрацює фокус вікна (якщо він увімкнений). Це ризиковано для UX.

### Резюме архітектора

Твоя проблема вирішується **одним рядком** у конфігурації.

У Next.js (SSR) патерн такий:

1. Ми робимо запит на сервері.
2. Ми хочемо, щоб клієнт довіряв цьому запиту певний час.
3. Тому використання **`staleTime` > 0** (наприклад, `5 * 1000` для 5 секунд або `60 * 1000` для хвилини) є **обов'язковим** для уникнення подвійних запитів при ініціалізації.

Встанови `staleTime: 60 * 1000`, і "зайвий" запит зникне.

## useSyncExternalStore

Це дуже глибоке і правильне технічне питання. Давай розберемося, як це працює на рівні архітектури React 18+ та TanStack Query v5.

Коротка відповідь: **`useSyncExternalStore` НЕ робить фетч.**
Фетч все одно відбувається як **Side Effect (Побічний ефект)**, тобто технічно це аналог `useEffect`.

Ось чому і як це працює:

### 1. Розподіл відповідальності

У React є суворе правило: **Під час рендеру (Render Phase) не можна робити Side Effects (HTTP-запити).**
`useSyncExternalStore` — це хук, який працює під час рендеру та коміту, але його головна мета — **підписатися на зміни** у зовнішньому сховищі (Store) і гарантувати, що UI не "розірветься" (Tearing) під час конкурентного рендерингу.

Тому ролі розподілені так:

1. **`useSyncExternalStore`**: Відповідає за **ЧИТАННЯ**. Він каже: _"Слідкуй за цим шматком кешу. Якщо він зміниться — перемалюй компонент"_ .
2. **`QueryObserver` (Внутрішній клас)**: Відповідає за **ЛОГІКУ**. Він вирішує, чи дані "протухли" і чи треба робити запит.
3. **Ефект (Internal Effect)**: Відповідає за **ЗАПИТ**.

### 2. Як саме запускається Fetch?

Коли ти пишеш `useQuery`, під капотом відбувається приблизно такий процес (спрощено):

1. **Створення (Render):** Створюється інстанс `QueryObserver`.
2. **Підписка (Commit):** React викликає `useSyncExternalStore`. Цей хук реєструє `Observer` у `QueryClient`.
3. **Перевірка (Mount):** Як тільки підписка відбулася (компонент змонтувався), `Observer` перевіряє стан: _"Ой, у нас немає даних (або вони stale)"_.
4. **Виклик (Fetch):** `Observer` запускає метод `fetch()`.

Цей запуск `fetch()` відбувається **асинхронно** або в мікротасці, що для React є еквівалентом роботи в `useEffect`.

### 3. Чому не робити фетч прямо в `useSyncExternalStore`?

Якщо спробувати зробити фетч всередині функції `getSnapshot` (яку приймає `useSyncExternalStore`), це зламає React, бо ця функція має бути чистою (pure) і повертати значення миттєво.

А якщо робити це в `subscribe` (функція підписки), то це якраз і є момент, коли компонент вже замаунтився (або закомітився). Тобто, **функція `subscribe` в `useSyncExternalStore` спрацьовує в той самий час, коли спрацьовує `useEffect**`(або`useLayoutEffect`).

### Псевдокод того, що відбувається всередині бібліотеки

Ось як це виглядає концептуально всередині TanStack Query:

```typescript
function useQuery(options) {
  // 1. Створюємо "мозок", який керує логікою
  const [observer] = useState(() => new QueryObserver(client, options));

  // 2. Підписуємось на оновлення стору (щоб отримати data, isLoading)
  // useSyncExternalStore гарантує, що ми отримаємо актуальний state
  const result = useSyncExternalStore(
    (onStoreChange) => {
      // Ця функція subscribe викликається після коміту (як useEffect)
      const unsubscribe = observer.subscribe(onStoreChange);

      // ⚡️ ОСЬ ТУТ МАГІЯ:
      // Після підписки Observer перевіряє, чи треба фетчити.
      // Якщо так — він запускає запит.
      observer.updateResult();

      return unsubscribe;
    },
    () => observer.getCurrentResult(),
  );

  return result;
}
```

### Висновок

Ти правий, що `useQuery` використовує `useSyncExternalStore` для **керування станом** (щоб уникнути зайвих ререндерів і проблем React 18).

Але **сам HTTP-запит (fetch)** ініціюється логікою `Observer`-а, яка запускається в момент підписки. З точки зору життєвого циклу React, це відбувається **в той самий момент, де працював би `useEffect**`.

Тобто:

- **Механізм підписки:** `useSyncExternalStore`.
- **Момент запуску фетчу:** Side Effect (після маунту).

Головний секрет полягає в тому, що **ти сам не сповіщаєш хук напряму**.

Коли React викликає твою функцію `subscribe`, він передає тобі спеціальну **callback-функцію** (зазвичай її називають `onStoreChange` або `notify`). Твоя задача — **зберегти цей callback** і викликати його, коли дані зміняться.

Ось механіка "на пальцях":

1. **React:** "Привіт, я хочу підписатися. Ось моя функція `callback`. Смикни її, коли щось зміниться."
2. **Твій Store:** "Ок, я поклав цей `callback` у масив `listeners`."
3. **Зміна даних:** Ти оновлюєш `state`.
4. **Сповіщення:** Твій Store проходить по масиву `listeners` і викликає кожен `callback()`.
5. **Реакція:** React чує виклик, запускає `getSnapshot`, бачить нові дані і робить ререндер.

### Реалізація (Pattern Observer)

Щоб це запрацювало, тобі потрібно реалізувати простий патерн "Спостерігач" (Observer).

Ось повний приклад "Store" з нуля:

```typescript
// 1. Створюємо зовнішнє сховище (Store)
const myStore = {
  state: { count: 0 },
  listeners: new Set<() => void>(), // Тут будуть жити функції React-а

  // Метод читання (getSnapshot)
  getState() {
    return myStore.state;
  },

  // Метод підписки (subscribe)
  subscribe(callback: () => void) {
    // 1. React дає нам callback, ми його зберігаємо
    myStore.listeners.add(callback);

    // 2. Повертаємо функцію відписки (cleanup)
    return () => myStore.listeners.delete(callback);
  },

  // Метод зміни даних (Action)
  increment() {
    // Важливо: Створюємо новий об'єкт (Immutability), щоб React побачив різницю
    myStore.state = { count: myStore.state.count + 1 };

    // ⚡️ ОСЬ ТУТ МИ СПОВІЩАЄМО REACT
    myStore.emitChange();
  },

  emitChange() {
    // Просто викликаємо всі збережені функції
    myStore.listeners.forEach((listener) => listener());
  },
};
```

### Використання в компоненті

```tsx
import { useSyncExternalStore } from 'react';

export default function Counter() {
  // Hook сам передасть свій внутрішній callback у myStore.subscribe
  const state = useSyncExternalStore(myStore.subscribe, myStore.getState);

  return <button onClick={() => myStore.increment()}>Count: {state.count}</button>;
}
```

### Критично важливі нюанси

1. **Immutability (Незмінність):**
   `useSyncExternalStore` перевіряє зміни через `Object.is` (сувора рівність).
   Якщо ти зробиш так:

```javascript
// ❌ Помилка: Посилання на об'єкт не змінилося
myStore.state.count++;
myStore.emitChange();
```

React викличе `getSnapshot`, отримає _той самий об'єкт_, порівняє його зі старим, побачить `true` і **не оновить компонент**, навіть якщо ти викликав лісенери.
Ти мусиш повертати **новий об'єкт** або примітив. 2. **Стабільність функцій:**
Функції `subscribe` та `getState` мають бути стабільними (не створюватися заново при кожному рендері), інакше ти потрапиш у нескінченний цикл перепідписок. Тому ми винесли `myStore` за межі компонента.

### Як це працює в React Query / Redux?

Вони роблять те саме, тільки їхній `state` набагато складніший, а `listeners` часто оптимізовані (наприклад, викликаються батчами, щоб не рендерити занадто часто).

Але суть одна: **React дає тобі "пульт" (callback), а ти натискаєш на кнопку, коли готовий.**
