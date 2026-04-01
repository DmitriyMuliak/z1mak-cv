# Claude Code Settings & Hook Patterns

## Hook Output Pattern

### Проблема

Claude Code показує вивід хуків тільки зі **stderr**. Більшість CLI-інструментів (tsc, eslint, vitest) пишуть результати в **stdout**. Через це при помилці ти бачиш лише:

```
Stop hook error: Failed with non-blocking status code: No stderr output
```

### Рішення — захопити, перевірити, перенаправити

```bash
OUT=$(command 2>&1)  # захопити stdout + stderr в змінну
EXIT=$?              # зберегти код виходу одразу після команди

if [[ $EXIT -ne 0 ]]; then
  echo "[hook-name] Error description:" >&2  # ідентифікатор хука
  echo "$OUT" >&2                             # деталі помилки → stderr
  exit 1                                      # позначити хук як failed
fi
# при успіху — мовчання, $OUT просто зникає
```

### Що і коли з'являється в Claude Code UI

| Ситуація                  | Що бачиш                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Хук пройшов               | Нічого — мовчання                                                                        |
| Хук впав, stderr порожній | `Stop hook error: Failed with non-blocking status code: No stderr output`                |
| Хук впав, stderr є        | `Stop hook error: Failed with non-blocking status code` + розгорнутий вивід з `[ctrl+o]` |

Префікс `[tsc]` / `[eslint]` / `[vitest]` в повідомленні одразу вказує який саме хук впав.

### Чому `2>&1` при захопленні, але `>&2` при виводі

- `OUT=$(command 2>&1)` — всередині `$()` перенаправляємо stderr→stdout щоб захопити **обидва** потоки в одну змінну
- `echo "$OUT" >&2` — при виводі перенаправляємо stdout→stderr щоб Claude Code побачив

### Перевірка локальних бінарників

`command -v tool` шукає тільки в `$PATH`. Локально встановлені пакети (`node_modules/.bin/`) не знаходить. Правильно:

```bash
# Неправильно — завжди false для локальних пакетів
if command -v vitest >/dev/null 2>&1; then ...

# Правильно
if [[ -f node_modules/.bin/vitest ]]; then ...
```

---

## `.claude/settings.json` — пояснення кожного налаштування

### `permissions`

```json
"permissions": {
  "allow": [...],
  "deny": [...],
  "defaultMode": "acceptEdits"
}
```

- **`allow`** — список інструментів і команд, які Claude може виконувати без підтвердження. `Bash(npm:*)` означає будь-яку npm-команду.
- **`deny`** — команди заблоковані назавжди. `Bash(rm -rf:*)` і `Bash(curl:*)` захищають від випадкового видалення файлів або мережевих запитів.
- **`defaultMode: "acceptEdits"`** — Claude автоматично застосовує зміни файлів (Edit/Write) без підтвердження, але Bash-команди поза allow-листом потребують підтвердження.

### `env`

```json
"env": {
  "BASH_DEFAULT_TIMEOUT_MS": "60000",
  "BASH_MAX_OUTPUT_LENGTH": "20000",
  "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR": "1",
  "NODE_ENV": "development"
}
```

- **`BASH_DEFAULT_TIMEOUT_MS`** — таймаут для кожної Bash-команди (мс). 60s підходить для більшості задач; довгі білди потребують більше.
- **`BASH_MAX_OUTPUT_LENGTH`** — максимальна кількість символів у відповіді Bash. Захищає контекст від переповнення при великих логах.
- **`CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR`** — якщо `1`, кожна команда запускається з кореня проекту незалежно від попереднього `cd`. Запобігає помилкам де команда виконується не там.
- **`NODE_ENV`** — передається в усі Bash-команди. Впливає на поведінку Next.js, webpack та інших інструментів.

### `includeCoAuthoredBy`

```json
"includeCoAuthoredBy": true
```

Додає `Co-Authored-By: Claude ...` в кожен git commit. Корисно для аудиту — видно які коміти писались з AI-допомогою.

### `cleanupPeriodDays`

```json
"cleanupPeriodDays": 30
```

Через скільки днів Claude Code автоматично видаляє старі транскрипти розмов з `~/.claude/projects/`.

---

### `hooks`

Хуки — shell-команди що запускаються автоматично при певних подіях.

#### `PreToolUse` — до виконання інструменту

**Bash audit log**

```json
{ "matcher": "Bash", ... }
```

Логує кожну Bash-команду в `~/.claude/bash-command-log.txt`. Корисно для аудиту — можна переглянути що Claude виконував протягом сесії.

**Block console.log**

```json
{ "matcher": "Write", ... }
```

Перед записом `.js/.ts` файлу перевіряє чи немає `console.log`. Якщо є — блокує запис (`exit 2`) і виводить попередження в stderr. `exit 2` = non-blocking блок (Claude бачить попередження але може продовжити).

**npm audit on package.json change**

```json
{ "matcher": "Write", ... }
```

Якщо змінюється `package.json` — запускає `npm audit --audit-level=moderate`. Автоматично перевіряє вразливості при додаванні залежностей.

#### `PostToolUse` — після виконання інструменту

**Auto-format with Prettier**

```json
{ "matcher": "Write|Edit|MultiEdit", ... }
```

Після кожного запису/редагування `.js/.ts/.json/.css` файлу автоматично форматує через Prettier. `2>/dev/null` — мовчить якщо Prettier не встановлений або файл не підтримується.

#### `Notification`

```json
{ "matcher": "", ... }
```

`matcher: ""` — спрацьовує на **всі** події. Логує timestamp кожного сповіщення в `~/.claude/notifications.log`.

#### `Stop` — після завершення відповіді Claude

Три хуки запускаються послідовно після кожної відповіді якщо є змінені `.js/.ts` файли.

**Hook 1 — tsc + eslint**

```json
{ "description": "Final type check and lint on changed files", ... }
```

1. `git diff --name-only HEAD` — знаходить змінені файли
2. `npx tsc --noEmit` — перевіряє типи по всьому проекту
3. `echo "$CHANGED" | xargs npx eslint` — лінтує тільки змінені файли (швидше ніж весь проект)

При помилці виводить `[tsc]` або `[eslint]` + деталі в stderr.

**Hook 2 — vitest**

```json
{ "description": "Run tests for changed source files", ... }
```

Запускає всі тести якщо є змінені _не-тестові_ файли. Фільтр `grep -vE '\.(test|spec)\.'` виключає самі тест-файли з тригера. Перевіряє `node_modules/.bin/vitest` (не `command -v`) бо vitest встановлений локально.

**Hook 3 — bundlesize**

```json
{ "description": "Bundle size analysis hint", ... }
```

Якщо встановлений `bundlesize` — перевіряє чи не перевищено ліміти бандлу. Якщо не встановлений — мовчить (немає fallback echo). Корисно підключити коли проект росте.

### Default Stop Hooks

```json
{
  "Stop": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "description": "Final type check and lint on changed files",
          "command": "if [[ -f package.json ]]; then CHANGED=$(git diff --name-only HEAD 2>/dev/null | grep -E '\\.(js|jsx|ts|tsx)$'); if [[ -n \"$CHANGED\" ]]; then echo 'Running final quality check...'; npx tsc --noEmit 2>&1 && npx eslint $CHANGED 2>&1; fi; fi",
          "timeout": 90
        }
      ]
    },
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "description": "Run tests for changed source files",
          "command": "if [[ -f package.json ]]; then CHANGED=$(git diff --name-only HEAD 2>/dev/null | grep -E '\\.(js|jsx|ts|tsx)$' | grep -vE '\\.(test|spec)\\.'); if [[ -n \"$CHANGED\" ]]; then echo 'Running related tests...'; if command -v vitest >/dev/null 2>&1; then npx vitest run --passWithNoTests 2>&1; elif command -v jest >/dev/null 2>&1; then npx jest --passWithNoTests 2>&1; fi; fi; fi",
          "timeout": 60
        }
      ]
    },
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "description": "Bundle size analysis hint",
          "command": "if [[ -f package.json ]] && git diff --name-only HEAD 2>/dev/null | grep -qE '\\.(js|jsx|ts|tsx)$'; then if command -v bundlesize >/dev/null 2>&1; then npx bundlesize 2>&1; else echo 'Bundle analysis: npx webpack-bundle-analyzer (run manually if needed)'; fi; fi",
          "timeout": 60
        }
      ]
    }
  ]
}
```
