'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { envType } from '@/utils/envType';
import type { FontOption } from '../pdf/registerFonts';

export type TemplateStyle = 'atsClean' | 'atsModern';

export type SectionKey =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  // 'header', --- IGNORE ---
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'languages',
];

export const TEMPLATE_OPTIONS: { value: TemplateStyle; label: string }[] = [
  { value: 'atsClean', label: 'ATS Clean' },
  { value: 'atsModern', label: 'ATS Modern' },
];

interface TemplateSettingsState {
  template: TemplateStyle;
  font: FontOption;
  pageCount: number;
  /** Per-page section render order. Index matches page index (0-based). */
  sectionOrder: SectionKey[][];
}

interface TemplateSettingsActions {
  setTemplate: (t: TemplateStyle) => void;
  setFont: (f: FontOption) => void;
  addPage: () => void;
  /** Decrement page count. Callers must also call resumeEditorStore.reassignEntriesFromPage(index). */
  deletePage: (index: number) => void;
  reorderSection: (pageIndex: number, fromKey: SectionKey, toKey: SectionKey) => void;
}

export const useTemplateSettingsStore = create<TemplateSettingsState & TemplateSettingsActions>()(
  devtools(
    (set) => ({
      template: 'atsClean',
      font: 'roboto',
      pageCount: 1,
      sectionOrder: [[...DEFAULT_SECTION_ORDER]],

      setTemplate: (template) => set({ template }),
      setFont: (font) => set({ font }),

      addPage: () =>
        set((s) => ({
          pageCount: s.pageCount + 1,
          sectionOrder: [...s.sectionOrder, [...DEFAULT_SECTION_ORDER]],
        })),

      deletePage: (index) =>
        set((s) => {
          if (s.pageCount <= 1 || index < 0 || index >= s.pageCount) return s;
          return {
            pageCount: s.pageCount - 1,
            sectionOrder: s.sectionOrder.filter((_, i) => i !== index),
          };
        }),

      reorderSection: (pageIndex, fromKey, toKey) =>
        set((s) => {
          const newOrder = s.sectionOrder.map((page) => [...page]);
          const page = newOrder[pageIndex];
          if (!page) return s;
          const from = page.indexOf(fromKey);
          const to = page.indexOf(toKey);
          if (from === -1 || to === -1 || from === to) return s;
          page.splice(from, 1);
          page.splice(to, 0, fromKey);
          return { sectionOrder: newOrder };
        }),
    }),
    { name: 'TemplateSettingsStore', enabled: envType.isDev },
  ),
);
