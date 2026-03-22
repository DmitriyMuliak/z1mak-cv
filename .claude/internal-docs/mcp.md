# Windows

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "chrome-devtools-mcp@latest"]
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    },
    "context7": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "filesystem": {
      "type": "stdio",
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/User/Desktop/z1mak-cv/z1mak-cv"
      ],
      "env": {}
    },
    "playwright": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@playwright/mcp@latest"],
      "env": {}
    },
    "puppeteer": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "puppeteer-mcp-server"],
      "env": {}
    },
    "github": {
      "name": "GitHub MCP",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "..."
      }
    },
    "slack": {
      "name": "Slack MCP",
      "command": "cmd",
      "args": ["/c", "node", "path/to/server-slack"],
      "env": {
        "SLACK_TOKEN": "..."
      }
    },
    "memory-bank": {
      "name": "Memory Bank MCP",
      "command": "cmd",
      "args": ["/c", "server-memory"],
      "env": {}
    },
    "brave-search": {
      "name": "Brave Search MCP",
      "command": "cmd",
      "args": ["/c", "server-brave-search"],
      "env": {}
    },
    "google-maps": {
      "name": "Google Maps MCP",
      "command": "cmd",
      "args": ["/c", "server-google-maps"],
      "env": {
        "GOOGLE_MAPS_API_KEY": "..."
      }
    },
    "deep-graph": {
      "name": "Deep Graph MCP (Code Graph)",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "mcp-code-graph@latest"],
      "env": {}
    }
  }
}
```

# Unix

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {}
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {}
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "puppeteer-mcp-server"],
      "env": {}
    },
    "github": {
      "name": "GitHub MCP",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "..."
      }
    },
    "slack": {
      "name": "Slack MCP",
      "command": "node",
      "args": ["path/to/server-slack"],
      "env": {
        "SLACK_TOKEN": "..."
      }
    },
    "memory-bank": {
      "name": "Memory Bank MCP",
      "command": "server-memory",
      "args": [],
      "env": {}
    },
    "brave-search": {
      "name": "Brave Search MCP",
      "command": "server-brave-search",
      "args": [],
      "env": {}
    },
    "google-maps": {
      "name": "Google Maps MCP",
      "command": "server-google-maps",
      "args": [],
      "env": {
        "GOOGLE_MAPS_API_KEY": "..."
      }
    },
    "deep-graph": {
      "name": "Deep Graph MCP (Code Graph)",
      "command": "npx",
      "args": ["-y", "mcp-code-graph@latest"],
      "env": {}
    }
  }
}
```
