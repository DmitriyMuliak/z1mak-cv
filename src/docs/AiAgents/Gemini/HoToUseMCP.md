**Gemini CLI реально “мерджить” MCP servers з кількох місць**, тому ти бачиш “4 MCP servers”, навіть якщо в корені проєкту лише `.gemini/settings.json`.

## Звідки беруться MCP servers (і чому їх більше)

Gemini CLI підтягує конфіги з **workspace (проєкт)**, **global (home)** і **extensions**. ([google-gemini.github.io][1])

Типові місця:

1. **Workspace settings** (у твоєму репо):
   `<project>/.gemini/settings.json` ([GitHub][2])

2. **Global settings** (в home):
   `~/.gemini/settings.json` ([Medium][3])

3. **Extensions (global)**:
   `~/.gemini/extensions/<extension-name>/gemini-extension.json` ([GitHub][4])

4. **Extensions (workspace)**:
   `<project>/.gemini/extensions/<extension-name>/gemini-extension.json` ([GitHub][4])

👉 Тому “4 MCP servers” = твої 3 з `.gemini/settings.json` + ще один прийшов або з `~/.gemini/settings.json`, або з extension’ів (наприклад chrome-devtools-mcp).

---

## Як знайти встановлені extensions

### Варіант 1 — через CLI

У gemini-cli:

- `/extensions list` ([Gemini CLI][5])

### Варіант 2 — через файлову систему

У терміналі:

```bash
ls -la ~/.gemini/extensions
ls -la ./.gemini/extensions
```

Якщо `chrome-devtools-mcp` ставився як extension — він має бути в одному з цих каталогів, і всередині буде `gemini-extension.json`. ([GitHub][4])

Якщо хочеш знайти всі extension-маніфести:

```bash
find ~/.gemini/extensions -maxdepth 3 -type f -name "gemini-extension.json" -print
```

---

## “Він якось помержив з різних місць?”

Так. Gemini CLI при старті **сканує extensions у двох локаціях і мерджить конфіги**, а при конфліктах **workspace перемагає**. ([Medium][6])

Тому:

- якщо extension додає `mcpServers.chrome-devtools` — він “допишеться” до списку
- якщо ти в `project/.gemini/settings.json` додаси сервер з тим самим ключем — твій варіант перекриє extension-варіант

---

## Чому падає MCP server `github`: `Connection closed`

Це майже завжди означає: **процес MCP сервера стартнув і одразу помер** (docker не запустився / токен не підхопився / токен не валідний / немає доступу). Для `ghcr.io/github/github-mcp-server` потрібна змінна **`GITHUB_PERSONAL_ACCESS_TOKEN`** — ти її назвав правильно. ([GitHub][7])

Швидка діагностика (зроби в терміналі, НЕ в gemini):

1. Переконайся, що токен реально є в env:

```bash
echo $GITHUB_PERSONAL_ACCESS_TOKEN
```

2. Запусти контейнер руками і подивись, що він пише (це дасть справжню причину):

```bash
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

Якщо впаде з текстом помилки — це і є причина “Connection closed”.

3. Перевір, що Docker взагалі живий:

```bash
docker ps
```

---

## Підсумок

- **Extensions не зобов’язані міняти твій `.gemini/settings.json`** — вони живуть у `~/.gemini/extensions` або `.gemini/extensions` і підвантажуються автоматично. ([GitHub][4])
- “4 MCP servers” — це **сума** з (project settings + global settings + extensions).
- “Connection closed” для github — **сервер помер**, найшвидше ловиться ручним `docker run ...`.

Якщо скинеш вивід команди `docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server` (хоча б останні 20 рядків) — скажу точно, що саме ламає запуск.

[1]: https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html?utm_source=chatgpt.com 'MCP servers with the Gemini CLI'
[2]: https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/configuration.md?utm_source=chatgpt.com 'gemini-cli/docs/get-started/configuration.md at main'
[3]: https://medium.com/google-cloud/gemini-cli-tutorial-series-part-3-configuration-settings-via-settings-json-and-env-files-669c6ab6fd44?utm_source=chatgpt.com 'Gemini CLI Tutorial Series — Part 3 : Configuration settings ...'
[4]: https://github.com/philschmid/gemini-cli-extension?utm_source=chatgpt.com 'Collection of helpful gemini cli extensions and commands'
[5]: https://geminicli.com/docs/extensions/?utm_source=chatgpt.com 'Gemini CLI extensions'
[6]: https://medium.com/google-cloud/gemini-cli-tutorial-series-part-11-gemini-cli-extensions-69a6f2abb659?utm_source=chatgpt.com 'Gemini CLI Tutorial Series — Part 11: Gemini CLI Extensions'
[7]: https://github.com/github/github-mcp-server?utm_source=chatgpt.com "GitHub's official MCP Server"

Так, `~/.gemini/extensions` — це **поза межами твого проєкту**. `~` = твій home-каталог користувача, тобто “глобально для всіх проєктів”.

### Чому він поставив extension саме туди

Бо команда `gemini extensions install ...` за замовчуванням робить **global install**:

- один раз встановив → доступно в будь-якому проєкті
- не треба комітити extension у репозиторій
- менше шуму в git і менше “у мене працює, у тебе ні” через випадково закомічені тулзи

Це той самий підхід, як `npm i -g` (умовно кажучи), тільки для gemini-cli.

### А як зробити, щоб extension був “всередині проєкту”

Є два варіанти (без магії):

1. **локально/вендорнути** extension у репо:

- створюєш `.gemini/extensions/<name>/...`
- або копіюєш туди з `~/.gemini/extensions/<name>/`
- і комітиш (якщо команда в команді має бути однакова у всіх)

2. Якщо gemini-cli підтримує “workspace install” (залежить від версії), то там має бути прапорець типу `-s workspace` або `--scope=workspace`.
   У різних версіях назва може відрізнятись, тому найшвидше:

- `/help` або `gemini extensions --help`
  і подивитись чи є `--scope`/`--local`.

### Коли що обирати

- **Global (`~/.gemini/extensions`)**: ти один, це твоя машина, хочеш швидко, не засмічувати репо.
- **Project-local (`<project>/.gemini/...`)**: команда/CI, потрібно щоб кожен розробник мав однакові інструменти, і щоб “підняв репу → все є”.

Якщо скажеш, у тебе це **для себе** чи **для команди/CI**, я дам найправильніший варіант структури `.gemini/` під репо (щоб і безпечно з токенами, і без “у мене працює”).
