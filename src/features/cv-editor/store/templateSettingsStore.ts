'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { envType } from '@/utils/envType';
import type { FontOption } from '../pdf/registerFonts';

export type TemplateStyle = 'atsClean' | 'atsModern';

export const TEMPLATE_OPTIONS: { value: TemplateStyle; label: string }[] = [
  { value: 'atsClean', label: 'ATS Clean' },
  { value: 'atsModern', label: 'ATS Modern' },
];

interface TemplateSettingsState {
  template: TemplateStyle;
  font: FontOption;
  /** Total number of pages. Each entry in the document has a `page` field (0-indexed). */
  pageCount: number;
}

interface TemplateSettingsActions {
  setTemplate: (t: TemplateStyle) => void;
  setFont: (f: FontOption) => void;
  addPage: () => void;
  /** Decrement page count. Callers must also call resumeEditorStore.reassignEntriesFromPage(index). */
  deletePage: (index: number) => void;
}

export const useTemplateSettingsStore = create<TemplateSettingsState & TemplateSettingsActions>()(
  devtools(
    (set) => ({
      template: 'atsClean',
      font: 'roboto',
      pageCount: 1,

      setTemplate: (template) => set({ template }),
      setFont: (font) => set({ font }),

      addPage: () => set((s) => ({ pageCount: s.pageCount + 1 })),

      deletePage: (index) =>
        set((s) => {
          if (s.pageCount <= 1 || index < 0 || index >= s.pageCount) return s;
          return { pageCount: s.pageCount - 1 };
        }),
    }),
    { name: 'TemplateSettingsStore', enabled: envType.isDev },
  ),
);
