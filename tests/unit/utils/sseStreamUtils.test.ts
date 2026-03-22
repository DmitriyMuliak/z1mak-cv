import { describe, it, expect } from 'vitest';
import {
  parseSseEventBlock,
  consumeSseStream,
  safeJsonParse,
  type SseEvent,
} from '@/utils/sseStreamUtils';

describe('parseSseEventBlock', () => {
  it('parses standard SSE format with event, id, and data', () => {
    const block = 'event: patch\nid: 123\ndata: {"op":"add"}';
    const result = parseSseEventBlock(block);

    expect(result).toEqual({
      event: 'patch',
      id: '123',
      data: '{"op":"add"}',
    });
  });

  it('handles multi-line data fields', () => {
    const block = 'event: snapshot\ndata: {"key": "value1"}\ndata: "value2"';
    const result = parseSseEventBlock(block);

    expect(result).toEqual({
      event: 'snapshot',
      data: '{"key": "value1"}\n"value2"',
    });
  });

  it('handles comment-prefixed JSON lines', () => {
    const block = ':{"event":"patch","data":{"op":"add"}}';
    const result = parseSseEventBlock(block);

    expect(result).toEqual({
      event: 'message',
      data: '{"event":"patch","data":{"op":"add"}}',
    });
  });

  it('handles raw JSON lines without SSE prefixes', () => {
    const block = '{"type":"patch","ops":[]}';
    const result = parseSseEventBlock(block);

    expect(result).toEqual({
      event: 'message',
      data: '{"type":"patch","ops":[]}',
    });
  });

  it('returns null for empty blocks', () => {
    const result = parseSseEventBlock('');
    expect(result).toBeNull();
  });

  it('returns null for blocks with only whitespace', () => {
    const result = parseSseEventBlock('  \n  \n  ');
    expect(result).toBeNull();
  });

  it('returns null for blocks with no JSON-like data', () => {
    const result = parseSseEventBlock('some text\nwithout json');
    expect(result).toBeNull();
  });

  it('handles raw JSON block when no structured fields present', () => {
    const block = '{"data": "value"}';
    const result = parseSseEventBlock(block);

    expect(result).toEqual({
      event: 'message',
      data: '{"data": "value"}',
    });
  });

  it('handles array JSON lines', () => {
    const block = '[1, 2, 3]';
    const result = parseSseEventBlock(block);

    expect(result).toEqual({
      event: 'message',
      data: '[1, 2, 3]',
    });
  });

  it('handles multi-line JSON in data field', () => {
    const block = 'event: message\ndata: {\ndata:   "key": "value"\ndata: }';
    const result = parseSseEventBlock(block);

    expect(result?.event).toBe('message');
    expect(result?.data).toContain('{');
    expect(result?.data).toContain('key');
  });

  it('trims trailing whitespace from lines', () => {
    const block = 'event: test  \ndata: {"test": true}  ';
    const result = parseSseEventBlock(block);

    expect(result?.event).toBe('test');
  });

  it('handles comment lines mixed with data', () => {
    const block = ': this is a comment\ndata: {"actual": "data"}';
    const result = parseSseEventBlock(block);

    expect(result?.data).toBe('{"actual": "data"}');
  });
});

describe('consumeSseStream', () => {
  it('parses multiple SSE events separated by double newlines', async () => {
    const text =
      'event: snapshot\nid: 1\ndata: {"status":"loading"}\n\nevent: patch\nid: 2\ndata: {"ops":[]}';
    const response = new Response(text);
    const abortSignal = new AbortController().signal;

    const events: SseEvent[] = [];
    await consumeSseStream(response, abortSignal, (ev) => events.push(ev));

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      event: 'snapshot',
      id: '1',
      data: '{"status":"loading"}',
    });
    expect(events[1]).toEqual({
      event: 'patch',
      id: '2',
      data: '{"ops":[]}',
    });
  });

  it('handles events split across multiple chunks', async () => {
    // Simulate streaming by using multiple chunks
    const chunk1 = 'event: snapshot\nid: 1\ndata: {';
    const chunk2 = '"status":"loading"}\n\nevent: patch\nid: 2\ndata: {}';

    const parts = [new TextEncoder().encode(chunk1), new TextEncoder().encode(chunk2)];

    let partIndex = 0;
    const mockStream = {
      getReader: () => ({
        read: async () => {
          if (partIndex < parts.length) {
            return { done: false, value: parts[partIndex++] };
          }
          return { done: true, value: undefined };
        },
      }),
    } as ReadableStream<Uint8Array>;

    const response = { body: mockStream } as Response;
    const abortSignal = new AbortController().signal;

    const events: SseEvent[] = [];
    await consumeSseStream(response, abortSignal, (ev) => events.push(ev));

    expect(events).toHaveLength(2);
  });

  it('respects abort signal', async () => {
    const abort = new AbortController();
    abort.abort();

    const response = new Response('event: test\ndata: test');
    const events: SseEvent[] = [];

    await consumeSseStream(response, abort.signal, (ev) => events.push(ev));

    // Should return immediately without processing
    expect(events).toHaveLength(0);
  });

  it('handles remaining buffer after stream ends', async () => {
    const text = 'event: message\ndata: final event';
    const response = new Response(text);
    const abortSignal = new AbortController().signal;

    const events: SseEvent[] = [];
    await consumeSseStream(response, abortSignal, (ev) => events.push(ev));

    expect(events).toHaveLength(1);
    expect(events[0]?.data).toBe('final event');
  });

  it('handles CRLF line endings', async () => {
    const text = 'event: test\r\ndata: value\r\n\r\nevent: test2\r\ndata: value2';
    const response = new Response(text);
    const abortSignal = new AbortController().signal;

    const events: SseEvent[] = [];
    await consumeSseStream(response, abortSignal, (ev) => events.push(ev));

    expect(events).toHaveLength(2);
  });

  it('skips empty events', async () => {
    const text = '\n\nevent: valid\ndata: test\n\n\n\n';
    const response = new Response(text);
    const abortSignal = new AbortController().signal;

    const events: SseEvent[] = [];
    await consumeSseStream(response, abortSignal, (ev) => events.push(ev));

    expect(events).toHaveLength(1);
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON objects', () => {
    const result = safeJsonParse('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('parses valid JSON arrays', () => {
    const result = safeJsonParse('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('parses JSON primitives', () => {
    expect(safeJsonParse('123')).toBe(123);
    expect(safeJsonParse('"string"')).toBe('string');
    expect(safeJsonParse('true')).toBe(true);
    expect(safeJsonParse('null')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const result = safeJsonParse('not valid json');
    expect(result).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    const result = safeJsonParse('{"unclosed": "object"');
    expect(result).toBeNull();
  });

  it('preserves type information with generics', () => {
    interface TestType {
      name: string;
      age: number;
    }

    const result = safeJsonParse<TestType>('{"name": "Alice", "age": 30}');
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('handles empty string', () => {
    const result = safeJsonParse('');
    expect(result).toBeNull();
  });

  it('handles JSON with extra whitespace', () => {
    const result = safeJsonParse('  { "key" : "value" }  ');
    expect(result).toEqual({ key: 'value' });
  });
});
