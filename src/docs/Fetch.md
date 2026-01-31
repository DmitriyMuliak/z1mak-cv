Ні, навпаки. **Status Code приходить найпершим.**

У протоколі HTTP відповідь сервера лінійна і виглядає так:

1. **Status Line:** `HTTP/1.1 200 OK` (Тут знаходиться код!)
2. **Headers:** `Content-Type: application/json`, `Content-Length: ...`
3. **Empty Line** (розділювач)
4. **Body:** `{ "data": ... }` (потік байтів)

### Як працює `await fetch()` на часовій шкалі:

1. **Start:** Браузер встановлює з'єднання і надсилає запит.
2. **Headers Receive:** Сервер віддає **Status Line** + **Headers**.
3. ➡️ **ТУТ спрацьовує `await fetch()`:** Проміс переходить у стан _fulfilled_. Ви отримуєте об'єкт `Response`, де `response.status` вже доступний. Тіло (Body) ще **не** завантажене (або завантажене частково).
4. **Body Receive:** Починається викачування тіла (якщо ви викликали `response.json()`).

### Чому це зроблено саме так (Архітектурний сенс)

Це дозволяє реалізувати патерн **Fail Fast**.

Ви можете перевірити статус і скасувати завантаження гігабайтних даних, якщо вони вам не потрібні (наприклад, помилка 401 або не той `Content-Type`), не забиваючи канал.

```javascript
const response = await fetch('/api/large-file');

// 1. Status Code вже тут. Тіло ще в дорозі.
console.log(response.status); // 200

// 2. Ми можемо прийняти рішення НЕ качати тіло
if (response.headers.get('Content-Type') !== 'application/zip') {
  // Миттєво обриваємо з'єднання, економимо трафік
  await response.body.cancel();
  return;
}

// 3. Якщо все ок — починаємо тягнути байт за байтом
const blob = await response.blob();
```

**Висновок:** `await fetch()` — це "рукостискання" (Headers + Status). Завантаження "вантажу" (Body) — це окремий, наступний крок.
