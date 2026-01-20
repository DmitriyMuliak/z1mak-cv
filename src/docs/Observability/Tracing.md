# Observability (Faro & Tempo/opentelemetry)

**Distributed Tracing** вирішує одну конкретну, але пекельну проблему мікросервісів та розподілених систем:
_"Користувач каже, що кнопка 'Оплатити' думала 10 секунд. Хто винен? Фронтенд (JS), мережа (latency), Бекенд (API), чи База Даних (Slow Query)?"_

Sentry покаже помилку (якщо вона була). Prometheus покаже графік затримки.
А **Tracing** покаже **Waterfall (водоспад)** виконання запиту крізь усі системи.

---

### 1. Основні гравці: OpenTelemetry vs Jaeger

Тут важливо не плутати терміни:

1. **OpenTelemetry (OTel):** Це **стандарт** і **бібліотеки** (SDK). Це "кур'єр", який збирає дані з твого Next.js, Go, Python, Java коду.

- _Головна фішка:_ Він вендор-нейтральний. Сьогодні ти шлеш дані в Jaeger, завтра в Datadog, післязавтра в Google Cloud Trace — код змінювати не треба.

2. **Jaeger:** Це **Бекенд і UI**. Це "склад" і "екран", де ти дивишся ці трейси. Він приймає дані від OTel і малює красиві графіки.

---

### 2. Як це працює? (The "Magic" Header) 🎩

Вся магія тримається на одному HTTP хедері.

1. **Frontend:** Ти робиш `fetch('/api/checkout')`. OTel перехоплює цей запит і додає хедер `traceparent`.

- `trace-id`: Унікальний ID всього ланцюжка (наприклад, `abc-123`).
- `span-id`: ID конкретно цієї операції на фронті.

2. **Network:** Запит летить на сервер.
3. **Backend:** Сервер бачить хедер `traceparent`. Він розуміє: "Ага, я не початок історії, я — продовження трейсу `abc-123`".
4. **Database:** Бекенд робить запит в БД, створюючи новий дочірній `span-id`.

В результаті Jaeger збирає ці шматочки пазла від різних сервісів і склеює їх в одну картинку по `trace-id`.

---

### 3. Frontend Implementation (Production Ready)

Для вебу використовуємо **OpenTelemetry Web SDK**.
Найкрутіше — нам не треба писати код для кожного запиту. Ми використовуємо **Auto-Instrumentation**.

**Встановлення:**
`npm install @opentelemetry/sdk-trace-web @opentelemetry/instrumentation-fetch @opentelemetry/exporter-trace-otlp-http`

**Код ініціалізації (tracing.ts):**

```typescript
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const enableTracing = () => {
  // 1. Експортер: Куди слати дані? (Зазвичай на OTel Collector)
  const exporter = new OTLPTraceExporter({
    url: 'https://your-otel-collector.com/v1/traces',
  });

  // 2. Провайдер: Хто ми такі?
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'my-frontend-app',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production',
    }),
  });

  // 3. Процесор: Як слати?
  // BatchSpanProcessor накопичує дані і шле пачками (краще для продуктивності)
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  // 4. Context Manager: Потрібен для асинхронного JS (Zone.js)
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // 5. Авто-інструментація: Магія тут ✨
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        // Додаємо traceparent хедер тільки для наших API
        // Щоб не слати сміття на Google Analytics чи Facebook
        propagateTraceHeaderCorsUrls: [/https:\/\/my-api\.com\/.*/, /http:\/\/localhost:3000\/.*/],
        clearTimingResources: true,
      }),
    ],
  });

  console.log('Tracing initialized');
};

export default enableTracing;
```

Викликаєш `enableTracing()` один раз при старті додатку (в `_app.tsx` або `layout.tsx`), але тільки в клієнтському середовищі (`useEffect`).

---

### 4. Що ми бачимо в результаті? (The Waterfall)

Коли ти відкриєш Jaeger UI, ти побачиш діаграму Ганта (Gantt Chart).

- **Total Time:** 2.5s
- **Span 1 (Frontend):** /checkout (тривав 2.5s)
- **Span 2 (Network):** DNS lookup + SSL handshake (200ms)
- **Span 3 (Backend LB):** Nginx routing (10ms)
- **Span 4 (Backend Service):** Controller logic (2.2s) — **Ось він, винуватець!**
- **Span 5 (DB):** UPDATE users ... (50ms) - швидко.
- **Span 6 (External API):** POST stripe.com (2.1s) - **Знайшли!** Stripe тупив.

Без трейсингу ти б звинувачував БД або свій React код. З трейсингом ти за 10 секунд довів, що проблема у зовнішньому вендорі.

---

### 5. Best Practices від Архітектора

1. **Sampling (Семплінг):**
   Трейсинг генерує величезну кількість даних. Логувати 100% запитів дорого і непотрібно.
   Встановіть `SamplingProbability: 0.1` (10% запитів). Цього достатньо для статистики.
2. **Context Propagation (W3C Standard):**
   Переконайтеся, що всі ваші сервіси підтримують стандарт **W3C Trace Context**. Раніше були різні формати (B3, Jaeger-header), зараз світ перейшов на W3C. OTel це робить за замовчуванням.
3. **Не трейсити статику:**
   Фільтруйте запити на `.css`, `.png`, `.woff2`. Вам не цікаво трейсити завантаження логотипу. Це робиться в налаштуваннях `FetchInstrumentation` (`ignoreUrls`).
4. **OTel Collector:**
   Frontend не повинен слати дані напряму в Jaeger DB. Він має слати їх в **OTel Collector** (проміжний легкий сервер). Collector буферизує, фільтрує (ховає токени) і потім пересилає в Jaeger.

---

### Фінальний акорд: Sentry vs Jaeger

У Sentry теж є Performance Monitoring і Distributed Tracing.

- **Якщо у вас Sentry вже куплений:** Використовуйте його. Їх SDK для фронта простіший, і вони теж малюють Waterfall.
- **Якщо ви будуєте Cloud Native систему (K8s):** OpenTelemetry + Jaeger — це індустріальний стандарт, який дає більше контролю і не коштує грошей за кожен спан (якщо хостити самим).

Тепер у тебе повний набір:

1. **Sentry:** Помилки.
2. **Prometheus:** Метрики/Тренди.
3. **Loki:** Логи/Контекст.
4. **Jaeger:** Трейси/Швидкодія.
