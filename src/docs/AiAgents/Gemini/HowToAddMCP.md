# Configure MCP servers

## How to add MCP servers

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_example_personal_access_token12345"
      }
    },
    "github-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "gitlab": {
      "command": "npx",
      "args": ["mcp-remote", "https://your-gitlab-instance.com/api/v4/mcp"]
    },
    "cloudflare-observability": {
      "command": "npx",
      "args": ["mcp-remote", "https://observability.mcp.cloudflare.com/sse"]
    },
    "cloudflare-bindings": {
      "command": "npx",
      "args": ["mcp-remote", "https://bindings.mcp.cloudflare.com/sse"]
    }
  }
}
```

Окей, це **MCP-конфіг для gemini-cli**. У тебе там два варіанти GitHub-сервера:

## 1) `github` (npx @modelcontextprotocol/server-github)

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "..." }
}
```

### Що це означає

- gemini-cli запускає **Node-процес** через `npx`.
- Тул **ставиться/підтягується на льоту** (або з кешу npm).
- Токен ти хардкодиш прямо в конфіг (це погано).

### Плюси

- **Просто і швидко стартувати**.
- Легко оновити версію (перезапустив — підтягнув нову).

### Мінуси

- Залежиш від npm/Node на машині.
- Версії можуть “поплисти” (сьогодні один реліз, завтра інший) якщо не пінити.
- **Секрет у файлі** — ризик зливу в git/бекупи/скріншоти.

---

## 2) `github-docker` (docker ghcr.io/github/github-mcp-server)

```json
"github-docker": {
  "command": "docker",
  "args": ["run","-i","--rm","-e","GITHUB_PERSONAL_ACCESS_TOKEN","ghcr.io/github/github-mcp-server"],
  "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" }
}
```

### Що це означає

- gemini-cli запускає **контейнер** з уже зібраним MCP сервером.
- Токен береться з **змінної оточення** (нормальна практика).
- Контейнер видаляється після завершення (`--rm`).

### Плюси

- **Ізоляція** (не засмічує node_modules/глобальні пакети).
- **Передбачуване середовище** (те саме в тебе і на CI).
- Секрети зручно тримати в env / secret store.

### Мінуси

- Потрібен Docker (на macOS інколи “повільна жаба”).
- Треба думати про доступи/мережу/volume (інколи).

---

# То в чому головна різниця?

**npx-варіант** — “запусти npm-пакет напряму з хоста”.
**docker-варіант** — “запусти готовий сервер у контейнері”.

По-простому: **npx = швидко і просто**, **docker = стабільно і чисто**.

---

# Як краще додавати MCP сервер для GitHub

Я б робив так:

## Рекомендовано для реальної роботи (і тим більше для роботи/петів з CI)

✅ **Docker-варіант**, але:

1. **не дублюй токен в конфіг**
2. **пінь образ по версії або digest**, щоб не ловити сюрпризи

Приклад (ідея):

- `ghcr.io/github/github-mcp-server:1.2.3` або `@sha256:...`
- токен лише через env

## Рекомендовано для “погратися за 5 хвилин”

✅ **npx-варіант**, але:

- теж не хардкодь токен в конфіг; краще `${GITHUB_PERSONAL_ACCESS_TOKEN}`
- і бажано пінити версію npm пакета (якщо підтримуєш), щоб не оновилось “вчора працювало — сьогодні впало”.

---

# Важливий момент: токен у прикладі

У тебе в JSON прямо:

```json
"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_example_personal_access_token12345"
```

Навіть якщо це “example” - Треба:

- зберігати токен у змінних оточення (shell / .env, але **не комітити**)
- або в OS keychain / secret manager
- або в CI secrets

---

## Useful MCP servers

Some handy [mcps](https://www.builder.io/blog/best-mcp-servers-2026)

- gemini extensions install https://github.com/github/github-mcp-server
- gemini extensions install https://github.com/GitLab-Ecosystem/Gemini-CLI-Extensions
- gemini extensions install https://github.com/gemini-cli-extensions/code-review
- gemini extensions install https://github.com/gemini-cli-extensions/security
- gemini extensions install https://github.com/supabase-community/supabase-mcp
- gemini extensions install https://github.com/ZhanZiyuan/vercel-mcp
- gemini extensions install https://github.com/redis/mcp-redis
- gemini extensions install https://github.com/gemini-cli-extensions/postgres
- gemini extensions install https://github.com/mongodb-partners/mongodb-gemini-extension
- gemini extensions install https://github.com/figma/figma-gemini-cli-extension
- gemini extensions install https://github.com/ox01024/gemini-cli-git
- gemini extensions install https://github.com/grafana/mcp-grafana
