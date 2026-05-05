import type { ResumeDocument } from '../schema/resumeDocument.schema';

// ---------------------------------------------------------------------------
// Editor store state
// ---------------------------------------------------------------------------

/**
 * The state slice of the resume editor Zustand store.
 *
 * `isDirty` tracks whether the document has unsaved changes relative to the
 * last persisted version, enabling the save/discard UI affordances.
 */
export interface ResumeEditorState {
  /** The CV document currently loaded in the editor. */
  document: ResumeDocument;
  /** `true` when the document has been modified since the last save. */
  isDirty: boolean;
}

// ---------------------------------------------------------------------------
// Editor store actions
// ---------------------------------------------------------------------------

/**
 * The actions slice of the resume editor Zustand store.
 *
 * These are the only mutation points for `ResumeEditorState`. All path-based
 * mutations use RFC 6902 JSON Pointer syntax (e.g. `/header/name`).
 */
export interface ResumeEditorActions {
  /**
   * Replace the entire document, e.g. when loading a saved CV.
   * Resets `isDirty` to `false`.
   *
   * @param doc - The new complete document to load into the editor.
   */
  setDocument: (doc: ResumeDocument) => void;

  /**
   * Update a single field identified by an RFC 6902 JSON Pointer path.
   * Sets `isDirty` to `true`.
   *
   * @param path  - RFC 6902 pointer to the field, e.g. `/header/email` or `/experience/0/title`.
   * @param value - The new value to write at that path.
   */
  updateField: (path: string, value: unknown) => void;

  /**
   * Discard all changes and restore the document to `defaultResumeDocument`.
   * Resets `isDirty` to `false`.
   */
  resetDocument: () => void;

  /**
   * Move an item within a list section by swapping positions identified by id.
   * Sets `isDirty` to `true`.
   */
  reorderItems: (
    section: 'experience' | 'education' | 'skills',
    activeId: string,
    overId: string,
  ) => void;

  /**
   * Called when a page is deleted at `deletedPageIndex`.
   * Moves all entries that were on the deleted page to the previous page,
   * and decrements the `page` field of entries on pages after the deleted one.
   */
  reassignEntriesFromPage: (deletedPageIndex: number) => void;
}

// ---------------------------------------------------------------------------
// Convenience union — use this when the store type is needed in full
// ---------------------------------------------------------------------------

/**
 * Full store type combining state and actions.
 *
 * Intended for use as the generic argument to `create<ResumeEditorStore>()`.
 *
 * @example
 * import { create } from 'zustand';
 * import type { ResumeEditorStore } from '@/features/cv-editor/types/editorStore.types';
 *
 * export const useResumeEditorStore = create<ResumeEditorStore>()((set) => ({
 *   document: defaultResumeDocument,
 *   isDirty: false,
 *   setDocument: (doc) => set({ document: doc, isDirty: false }),
 *   updateField: (path, value) => { ... },
 *   resetDocument: () => set({ document: defaultResumeDocument, isDirty: false }),
 * }));
 */
export type ResumeEditorStore = ResumeEditorState & ResumeEditorActions;
