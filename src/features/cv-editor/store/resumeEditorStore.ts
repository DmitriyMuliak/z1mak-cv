'use client';

import { create, useStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import { produce } from 'immer';
import { envType } from '@/utils/envType';
import { defaultResumeDocument, type ResumeDocument } from '../schema/resumeDocument.schema';
import type { ResumeEditorStore } from '../types';

// ---------------------------------------------------------------------------
// Path parsing utility
// ---------------------------------------------------------------------------

/**
 * Parses an RFC 6902 JSON Pointer (e.g. `/header/name`, `/experience/0/title`)
 * and applies the value at that path to the Immer draft.
 *
 * Handles:
 * - Nested object keys  (`/header/email`)
 * - Array index segments (`/experience/0/bullets/1`)
 */
function applyAtPath(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draft: Record<string, any>,
  path: string,
  value: unknown,
): void {
  // RFC 6902 paths start with "/" — split and drop the first empty string
  const segments = path.split('/').slice(1);

  if (segments.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: Record<string, any> = draft;

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const key = /^\d+$/.test(seg) ? Number(seg) : seg;
    cursor = cursor[key] as typeof cursor;
    if (cursor == null) {
      console.error(`[resumeEditorStore] updateField: path segment "${seg}" is null/undefined`);
      return;
    }
  }

  const lastSeg = segments[segments.length - 1];
  const lastKey = /^\d+$/.test(lastSeg) ? Number(lastSeg) : lastSeg;
  cursor[lastKey] = value;
}

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

/**
 * Global Zustand store for the inline CV editor.
 *
 * Wraps with:
 * - `temporal` (zundo) — tracks undo/redo history
 * - `devtools` — Redux DevTools integration in development
 *
 * @example
 * const document = useResumeEditorStore(s => s.document);
 * const updateField = useResumeEditorStore(s => s.updateField);
 */
export const useResumeEditorStore = create<ResumeEditorStore>()(
  temporal(
    devtools(
      (set, get) => ({
        document: defaultResumeDocument,
        isDirty: false,

        setDocument: (doc: ResumeDocument) => {
          set({ document: doc, isDirty: false });
        },

        updateField: (path: string, value: unknown) => {
          const next = produce(get().document, (draft) => {
            applyAtPath(draft as Record<string, unknown>, path, value);
          });
          set({ document: next, isDirty: true });
        },

        resetDocument: () => {
          set({ document: defaultResumeDocument, isDirty: false });
        },
      }),
      { name: 'ResumeEditorStore', enabled: envType.isDev },
    ),
    {
      // Only track the document in temporal history, not isDirty
      partialize: (state) => ({ document: state.document }),
      limit: 100,
    },
  ),
);

// ---------------------------------------------------------------------------
// Temporal history hook
// ---------------------------------------------------------------------------

/**
 * Returns undo/redo controls sourced from zundo's temporal store.
 *
 * @example
 * const { undo, redo, pastStates, futureStates } = useResumeEditorHistory();
 */
export function useResumeEditorHistory() {
  const undo = useStore(useResumeEditorStore.temporal, (s) => s.undo);
  const redo = useStore(useResumeEditorStore.temporal, (s) => s.redo);
  const canUndo = useStore(useResumeEditorStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useResumeEditorStore.temporal, (s) => s.futureStates.length > 0);

  return { undo, redo, canUndo, canRedo };
}
