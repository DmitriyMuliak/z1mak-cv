# Chat in IDE

## Gemini CLI core: Tools API

https://github.com/google-gemini/gemini-cli/blob/main/docs/core/tools-api.md

## Gemini CLI core: Built-in tools

https://github.com/google-gemini/gemini-cli/blob/main/docs/core/tools-api.md#built-in-tools

**File system tools:**

- LSTool (ls.ts): Lists directory contents.
- ReadFileTool (read-file.ts): Reads the content of a single file.
- WriteFileTool (write-file.ts): Writes content to a file.
- GrepTool (grep.ts): Searches for patterns in files.
- GlobTool (glob.ts): Finds files matching glob patterns.
- EditTool (edit.ts): Performs in-place modifications to files (often requiring confirmation).
- ReadManyFilesTool (read-many-files.ts): Reads and concatenates content from multiple files or glob patterns (used by the @ command in CLI).

**Execution tools:**

- ShellTool (shell.ts): Executes arbitrary shell commands (requires careful sandboxing and user confirmation).

**Web tools:**

- WebFetchTool (web-fetch.ts): Fetches content from a URL.
- WebSearchTool (web-search.ts): Performs a web search.

**Memory tools:**

- MemoryTool (memoryTool.ts): Interacts with the AI's memory.

## Getting Started with Agent Skills

Agent Skills allow you to extend Gemini CLI with specialized expertise. This tutorial will guide you through creating your first skill, enabling it, and using it in a session.

https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/tutorials/skills-getting-started.md

## Limitations

https://developers.google.com/gemini-code-assist/docs/agent-mode#limitations

Some features of standard Gemini Code Assist chat might not be available in agent mode or might work differently than they do in standard chat.

**Recitation is not available in agent mode. While in agent mode, Gemini doesn't cite sources and you can't disable code suggestions that match cited sources**.

- How and when Gemini Code Assist cites sources

https://developers.google.com/gemini-code-assist/docs/works#how-when-gemini-cites-sources

- Disable code suggestions that match cited sources

https://developers.google.com/gemini-code-assist/docs/write-code-gemini#disable_code_suggestions_that_match_cited_sources

## Advanced Model Configuration

https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/generation-settings.md
