/**
 * Shared SSE (Server-Sent Events) stream parsing utilities.
 * Used by both legacy and V2 streaming hooks.
 */

export type SseEvent = {
  id?: string;
  event: string;
  data: string;
};

/**
 * Parses a single SSE event block (text between two `\n\n` separators).
 * Handles standard `event:`, `id:`, `data:` fields, comment lines with
 * JSON payloads, and raw JSON lines without SSE field prefixes.
 */
export const parseSseEventBlock = (block: string): SseEvent | null => {
  const lines = block.split('\n');
  let event = 'message';
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line) continue;

    // Some backends send payload as comment-prefixed lines (e.g. :{...}).
    if (line.startsWith(':')) {
      const maybeJson = line.slice(1).trimStart();
      if (maybeJson.startsWith('{') || maybeJson.startsWith('[')) {
        dataLines.push(maybeJson);
      }
      continue;
    }

    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim();
      continue;
    }

    if (line.startsWith('id:')) {
      id = line.slice('id:'.length).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
      continue;
    }

    // Support raw JSON lines without SSE field prefixes.
    if (line.startsWith('{') || line.startsWith('[')) {
      dataLines.push(line);
    }
  }

  if (!id && dataLines.length === 0 && event === 'message') {
    const rawBlock = block.trim();
    const normalizedRaw = rawBlock.startsWith(':') ? rawBlock.slice(1).trimStart() : rawBlock;
    const isJsonLike = normalizedRaw.startsWith('{') || normalizedRaw.startsWith('[');
    if (!isJsonLike) return null;
    return { id, event: 'message', data: normalizedRaw };
  }

  return { id, event, data: dataLines.join('\n') };
};

/**
 * Reads an SSE response stream and calls `onEvent` for each parsed event block.
 * Splits the stream on `\n\n` boundaries. Handles cross-chunk block boundaries.
 */
export const consumeSseStream = async (
  response: Response,
  signal: AbortSignal,
  onEvent: (event: SseEvent) => void,
): Promise<void> => {
  if (!response.body) throw new Error('Response body is null');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    if (signal.aborted) return;

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const parsed = parseSseEventBlock(block);
      if (parsed) onEvent(parsed);
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseEventBlock(buffer);
    if (parsed) onEvent(parsed);
  }
};

export const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};
