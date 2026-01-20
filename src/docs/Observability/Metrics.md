# Metrics (Prometheus)

Багато хто плутає **Sentry** та **Prometheus**.

Давай розділимо зони відповідальності:

- **Sentry (Logs/Errors):** "Чому впало у конкретного юзера?" (Деталі, стек-трейс).
- **Prometheus (Metrics):** "Як почувається система в цілому?" (Тренди, числа, графіки).
- **Grafana:** Це просто "телевізор" (UI), який малює красиві графіки з даних Prometheus.

**Prometheus — це Time-Series Database (База Даних Часових Рядів).**
Він не зберігає "івенти" (події), він зберігає **метрики** (числа в момент часу).

### У чому принципова різниця?

1. **Івент (Event) — це історія.**

- _Приклад:_ "Користувач Ivan купив iPhone за $1000 о 12:00".
- _Де зберігати:_ **Sentry** (якщо помилка), **Elasticsearch/ELK** (логи), **Postgres** (транзакції).
- _Prometheus це ненавидить:_ Якщо ти спробуєш запхати сюди ID юзера або текст — Prometheus "ляже" (проблема High Cardinality).

2. **Метрика (Metric) — це статистика.**

- _Приклад:_ "О 12:00 кількість продажів зросла на +1. Загальна сума = $15000".
- _Де зберігати:_ **Prometheus**.
- _Суть:_ Prometheus все одно, _хто_ купив. Йому важливо _скільки_ купили і _як швидко_.

---

### То що ж робить Prometheus?

Уяви, що Prometheus — це **вахтер з лічильником**, який кожні 15 секунд підходить до твого додатку і питає: "Які зараз цифри?"

1. **Агрегація (Scraping):**
   Він не чекає, поки ти надішлеш йому івент. Він сам приходить (Pull model) і забирає поточний стан лічильників.
2. **Зберігання (Storage):**
   Він дуже ефективно стискає ці цифри. Він може зберігати роки даних про завантаження CPU, не займаючи терабайти місця (на відміну від логів).
3. **Alerting (Розумні сповіщення):**
   Він не просто шле алерт "Сталася подія". Він рахує **математику**.

- _Поганий алерт (Event-based):_ "Помилка 500". (Може блимнути раз і зникнути).
- _Prometheus алерт (Metric-based):_ "Протягом останніх 5 хвилин кількість 500-х помилок перевищує 5% від загального трафіку". Це вже інцидент.

### Як це виглядає на практиці (Business Case)

Припустимо, ми трекаємо бізнес-подію **"Оплата замовлення"**.

| Інструмент     | Що він "бачить" і записує                                                 | Питання, на яке відповідає                                 |
| -------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Sentry**     | `Error: Payment Gateway Timeout. Context: { userId: 55, cartId: 99 }`     | "Чому не пройшла оплата у конкретного юзера?"              |
| **Loki / ELK** | `[INFO] Order #99 created. [INFO] Payment start. [INFO] Payment success.` | "Яка повна хронологія дій цього юзера?"                    |
| **Prometheus** | `payment_success_total: 1054` -> через 15с -> `1055`                      | "Чи не впала у нас загальна конверсія оплат після релізу?" |

### Резюме

**Prometheus** — це для **Dashboarding** та **Trending**.

- Він малює графіки: "Ми ростемо чи падаємо?", "Сайт гальмує чи літає?".
- Він агрегує бізнес-івенти **до рівня чисел** (лічильників).

**Grafana** — це просто (UI) для Prometheus. Сама Grafana нічого не зберігає, вона просто робить запити в Prometheus і малює картинки.

## Ось архітектурний гайд по метриках для фронтенду.

---

### 1. Архітектура: Як "достукатися" з браузера?

Prometheus працює за моделлю **PULL** (він сам приходить і забирає дані з серверів). Він не може прийти в браузер до клієнта.

**Production Pattern:**
Браузер **НЕ** пише в Prometheus напряму.

1. Frontend відправляє легкий `POST /api/metrics` на твій BFF (Next.js server / Nginx / Go backend).
2. Backend агрегує ці дані у пам'яті.
3. Prometheus забирає їх з бекенда (`GET /metrics`).

---

### 2. Що саме логувати (What to Measure)

Ми не пишемо сюди текст помилок (це в Sentry). Ми пишемо **числа**.

#### А. Web Vitals (Performance)

Це "здоров'я" твого UI.

- **LCP (Largest Contentful Paint):** Швидкість завантаження.
- **CLS (Cumulative Layout Shift):** Стабільність верстки.
- **INP (Interaction to Next Paint):** Відгук інтерфейсу.

#### Б. API Reliability (Client-side view)

Бекенд може казати, що він відповідає за 50мс. Але у юзера з 3G це займає 2 секунди.

- **Client HTTP Duration:** Реальний час запиту.
- **Success/Error Rate:** Кількість успішних vs провалених запитів.

#### В. Business/Feature Usage

- Кількість кліків на кнопку "Buy".
- Кількість перемикань теми (Dark/Light).
- Кількість успішних завантажень файлів.

---

### 3. Реалізація (Code Examples)

Використовуємо стандарт де-факто для Node.js/Next.js: `prom-client`.

#### Крок 1: Налаштування на стороні сервера (Next.js API)

Створюємо endpoint, який буде приймати дані з фронта і оновлювати метрики.

```typescript
// lib/metrics.ts
import client from 'prom-client';

// Створюємо реєстр (щоб не дублювати метрики при hot-reload)
const register = new client.Registry();

// 1. Гістограма для часу завантаження (Web Vitals)
export const webVitalsMetric = new client.Histogram({
  name: 'frontend_web_vitals',
  help: 'Web Vitals values (LCP, CLS, FID)',
  labelNames: ['metric_name', 'page_path'], // Теги для фільтрації
  buckets: [0.1, 0.5, 1, 2, 5], // Бакети в секундах
});

// 2. Лічильник бізнес-подій
export const businessEventsCounter = new client.Counter({
  name: 'frontend_business_events_total',
  help: 'Count of business actions',
  labelNames: ['event_type', 'status'], // напр. type="checkout", status="success"
});

register.registerMetric(webVitalsMetric);
register.registerMetric(businessEventsCounter);

export { register };
```

#### Крок 2: Endpoint для Prometheus (щоб він забрав дані)

```typescript
// pages/api/metrics/scrape.ts (Next.js Page Router)
// або app/api/metrics/route.ts (App Router)
import { register } from '@/lib/metrics';

export default async function handler(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
}
```

#### Крок 3: Endpoint для Фронтенда (куди слати дані)

```typescript
// pages/api/telemetry.ts
import { webVitalsMetric, businessEventsCounter } from '@/lib/metrics';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { metric, value, tags } = req.body;

  if (metric === 'web-vitals') {
    // tags.name = 'LCP', tags.path = '/'
    webVitalsMetric.labels(tags.name, tags.path).observe(value);
  } else if (metric === 'business-event') {
    businessEventsCounter.labels(tags.type, tags.status).inc();
  }

  res.status(200).json({ ok: true });
}
```

#### Крок 4: Відправка з клієнта (Best Practice)

Використовуй `navigator.sendBeacon`. Це надійніше за `fetch`, бо працює навіть якщо юзер закрив вкладку.

```typescript
// utils/analytics.ts

export const sendMetric = (name: string, value: number, tags: Record<string, string>) => {
  const payload = JSON.stringify({ metric: name, value, tags });

  // sendBeacon відправляє POST, не блокуючи закриття сторінки
  const blob = new Blob([payload], { type: 'application/json' });
  navigator.sendBeacon('/api/telemetry', blob);
};

// Приклад використання для Web Vitals (next/web-vitals)
export function reportWebVitals(metric: any) {
  sendMetric('web-vitals', metric.value, {
    name: metric.name,
    path: window.location.pathname,
  });
}
```

---

### 4. Критичний момент: High Cardinality ⚠️

Це те, на чому "горять" джуніори і мідли.
Prometheus зберігає дані як: `MetricName{tag="value"}`.

**НІКОЛИ** не використовуй як значення тегів (labels) дані, які мають безліч варіацій:

- ❌ `user_id` (якщо у вас 100к юзерів — Prometheus вибухне).
- ❌ `url` (якщо там є ID: `/product/12345` — це створить мільйон метрик).
- ❌ `email`, `trace_id`.

**ПРАВИЛЬНО:**

- ✅ `status_code` ("200", "500" — їх мало).
- ✅ `route_pattern` ("/product/:id" — це один рядок).
- ✅ `browser_type` ("Chrome", "Firefox").

---

### 5. Що малювати в Grafana?

Ти робиш дашборд "Frontend Overview". Ось 3 панелі, які там мають бути:

1. **Apdex Score (UX Index):**
   Графік на основі LCP.

- Зелена зона: < 2.5s
- Жовта: < 4s
- Червона: > 4s
- _Query:_ `histogram_quantile(0.95, rate(frontend_web_vitals_bucket[5m]))`

2. **Traffic by Route:**
   Які сторінки зараз найпопулярніші (RPS).

- _Query:_ `sum(rate(frontend_business_events_total{event_type="page_view"}[1m])) by (page_path)`

3. **Business Conversion Spikes:**
   Графік "Checkout Success" vs "Checkout Error".
   Якщо лінія помилок різко йде вгору — це алерт для бізнесу.
