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

export type SectionPageSettings = {
  hideTitle: boolean;
};

/** Per-page, per-section settings: sectionSettings[pageIndex][sectionKey] */
export type SectionSettings = Array<Partial<Record<SectionKey, SectionPageSettings>>>;

interface TemplateSettingsState {
  template: TemplateStyle;
  font: FontOption;
  pageCount: number;
  /** Per-page section render order. Index matches page index (0-based). */
  sectionOrder: SectionKey[][];
  /** Per-page, per-section UI settings (e.g. hideTitle). */
  sectionSettings: SectionSettings;
}

interface TemplateSettingsActions {
  setTemplate: (t: TemplateStyle) => void;
  setFont: (f: FontOption) => void;
  addPage: () => void;
  /** Decrement page count. Callers must also call resumeEditorStore.reassignEntriesFromPage(index). */
  deletePage: (index: number) => void;
  reorderSection: (pageIndex: number, fromKey: SectionKey, toKey: SectionKey) => void;
  setSectionSetting: (
    pageIndex: number,
    sectionKey: SectionKey,
    patch: Partial<SectionPageSettings>,
  ) => void;
}

export const useTemplateSettingsStore = create<TemplateSettingsState & TemplateSettingsActions>()(
  devtools(
    (set) => ({
      template: 'atsClean',
      font: 'roboto',
      pageCount: 1,
      sectionOrder: [[...DEFAULT_SECTION_ORDER]],
      sectionSettings: [{}],

      setTemplate: (template) => set({ template }),
      setFont: (font) => set({ font }),

      addPage: () =>
        set((s) => ({
          pageCount: s.pageCount + 1,
          sectionOrder: [...s.sectionOrder, [...DEFAULT_SECTION_ORDER]],
          sectionSettings: [...s.sectionSettings, {}],
        })),

      deletePage: (index) =>
        set((s) => {
          if (s.pageCount <= 1 || index < 0 || index >= s.pageCount) return s;
          return {
            pageCount: s.pageCount - 1,
            sectionOrder: s.sectionOrder.filter((_, i) => i !== index),
            sectionSettings: s.sectionSettings.filter((_, i) => i !== index),
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

      setSectionSetting: (pageIndex, sectionKey, patch) =>
        set((s) => {
          const newSettings = s.sectionSettings.map((p, i) => {
            if (i !== pageIndex) return p;
            const prev = p[sectionKey] ?? { hideTitle: false };
            return { ...p, [sectionKey]: { ...prev, ...patch } };
          });
          return { sectionSettings: newSettings };
        }),
    }),
    { name: 'TemplateSettingsStore', enabled: envType.isDev },
  ),
);
