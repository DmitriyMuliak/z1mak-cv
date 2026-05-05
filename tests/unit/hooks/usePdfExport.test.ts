/**
 * usePdfExport — unit tests
 *
 * Strategy:
 * - Replace the global Worker with a controllable class mock.
 * - Verify state transitions (isGenerating), download triggering, and error propagation.
 * - No real Web Worker or @react-pdf/renderer is invoked in these tests.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePdfExport } from '@/features/cv-editor/hooks/usePdfExport';
import type { ResumeDocument } from '@/features/cv-editor/schema/resumeDocument.schema';

// ---------------------------------------------------------------------------
// Minimal stub document
// ---------------------------------------------------------------------------

const stubDocument: ResumeDocument = {
  header: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: undefined,
    location: undefined,
    linkedin: undefined,
    website: undefined,
  },
  summary: undefined,
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};

// ---------------------------------------------------------------------------
// Controllable Worker mock
// ---------------------------------------------------------------------------

interface MockWorkerControl {
  /** Simulate a successful worker response with the given PDF bytes. */
  resolve: (pdfBytes: Uint8Array) => void;
  /** Simulate a worker responding with an error payload. */
  reject: (message: string) => void;
  /** Access the underlying mock methods for assertions. */
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
}

let workerControl: MockWorkerControl | null = null;

/**
 * A class-based Worker stub that captures onmessage/onerror handlers
 * so tests can drive them synchronously.
 */
class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor(_url: URL | string) {
    // Expose controls to the test via the module-level variable
    workerControl = {
      resolve: (pdfBytes: Uint8Array) => {
        this.onmessage?.({ data: { pdf: pdfBytes } } as MessageEvent);
      },
      reject: (message: string) => {
        this.onmessage?.({ data: { error: message } } as MessageEvent);
      },
      postMessage: this.postMessage,
      terminate: this.terminate,
    };
  }
}

// ---------------------------------------------------------------------------
// DOM download helpers mock
// ---------------------------------------------------------------------------

interface AnchorStub {
  href: string;
  download: string;
  style: { display: string };
  click: ReturnType<typeof vi.fn>;
}

function setupDomMocks(): AnchorStub {
  const anchor: AnchorStub = {
    href: '',
    download: '',
    style: { display: '' },
    click: vi.fn(),
  };

  // Capture the original before spying to prevent infinite recursion
  const originalCreateElement = document.createElement.bind(document);

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') return anchor as unknown as HTMLElement;
    return originalCreateElement(tag);
  });

  vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
  vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

  return anchor;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePdfExport', () => {
  beforeEach(() => {
    workerControl = null;
    global.Worker = FakeWorker as unknown as typeof Worker;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('starts with isGenerating = false', () => {
    const { result } = renderHook(() => usePdfExport());
    expect(result.current.isGenerating).toBe(false);
  });

  it('sets isGenerating = true while PDF is generating', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    act(() => {
      // Start the export but do NOT resolve the worker yet
      result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1).catch(() => {});
    });

    expect(result.current.isGenerating).toBe(true);
  });

  it('resets isGenerating = false after successful export', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());
    const fakeBytes = new Uint8Array([1, 2, 3]);

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1);
      workerControl!.resolve(fakeBytes);
      await exportPromise;
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('triggers a download anchor click on success', async () => {
    const anchor = setupDomMocks();
    const { result } = renderHook(() => usePdfExport());
    const fakeBytes = new Uint8Array([10, 20, 30]);

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1);
      workerControl!.resolve(fakeBytes);
      await exportPromise;
    });

    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.href).toBe('blob:mock-url');
    expect(anchor.download).toMatch(/Jane_Doe_clean\.pdf$/);
  });

  it('uses "_modern" suffix for atsModern template', async () => {
    const anchor = setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsModern', 'roboto', 1);
      workerControl!.resolve(new Uint8Array([1]));
      await exportPromise;
    });

    expect(anchor.download).toMatch(/_modern\.pdf$/);
  });

  it('resets isGenerating = false and rejects on worker error payload', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1);
      workerControl!.reject('Rendering failed');
      await expect(exportPromise).rejects.toThrow('Rendering failed');
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('terminates the worker after a successful response', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1);
      workerControl!.resolve(new Uint8Array([0]));
      await exportPromise;
    });

    expect(workerControl!.terminate).toHaveBeenCalledOnce();
  });

  it('terminates the worker after an error response', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1);
      workerControl!.reject('boom');
      await expect(exportPromise).rejects.toThrow('boom');
    });

    expect(workerControl!.terminate).toHaveBeenCalledOnce();
  });

  it('defaults to atsClean when no template argument is provided', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsClean', 'roboto', 1);
      workerControl!.resolve(new Uint8Array([0]));
      await exportPromise;
    });

    const postedMessage = workerControl!.postMessage.mock.calls[0][0];
    expect(postedMessage.template).toBe('atsClean');
  });

  it('posts the correct template and document to the worker', async () => {
    setupDomMocks();
    const { result } = renderHook(() => usePdfExport());

    await act(async () => {
      const exportPromise = result.current.exportPdf(stubDocument, 'atsModern', 'roboto', 1);
      workerControl!.resolve(new Uint8Array([0]));
      await exportPromise;
    });

    const postedMessage = workerControl!.postMessage.mock.calls[0][0];
    expect(postedMessage.template).toBe('atsModern');
    expect(postedMessage.document).toEqual(stubDocument);
  });
});
