# Крок 1. Створити самопідписаний сертифікат

## Використаємо mkcert — 
Це найзручніший варіант, бо він автоматично додає довірений локальний CA у твій браузер (тобто, не буде “Not Secure”).

### Mac / Linux
```
brew install mkcert nss
```

### Windows (через Chocolatey)
```
choco install mkcert
```

### Потім:
```
mkcert -install
```


## 🔒 Створюємо сертифікат:

```
mkcert localhost
```

### Це створить два файли:

```
localhost.pem        # сертифікат
localhost-key.pem    # приватний ключ
```


# ⚙️ Крок 2. Створити server.js

### Vite / Next.js:

```
mkcert localhost
```

створює localhost-key.pem і localhost.pem, а потім у next.config.js:

```
import fs from 'fs'

export default {
  devServer: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
  },
}

```
або юзати ngrok, cloudflared чи localtunnel для HTTPS тунелювання.

### 🧠 Варіант з Express

```
// server.js
import https from "https";
import fs from "fs";
import express from "express"; // або без express, але з ним зручніше

const app = express();

// просто маршрут для тесту
app.get("/", (req, res) => {
  res.send("✅ HTTPS сервер працює на localhost:3000");
});

// читаємо сертифікати
const options = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

// створюємо HTTPS сервер
https.createServer(options, app).listen(3000, () => {
  console.log("🚀 HTTPS сервер запущений на https://localhost:3000");
});

```

### 🧠 Варіант без Express

```
// server.js
import https from "https";
import fs from "fs";

const options = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

https
  .createServer(options, (req, res) => {
    res.writeHead(200);
    res.end("Hello from pure Node.js HTTPS!");
  })
  .listen(3000, () => console.log("✅ HTTPS running on https://localhost:3000"));

```