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
}

interface TemplateSettingsActions {
  setTemplate: (t: TemplateStyle) => void;
  setFont: (f: FontOption) => void;
}

export const useTemplateSettingsStore = create<TemplateSettingsState & TemplateSettingsActions>()(
  devtools(
    (set) => ({
      template: 'atsClean',
      font: 'roboto',
      setTemplate: (template) => set({ template }),
      setFont: (font) => set({ font }),
    }),
    { name: 'TemplateSettingsStore', enabled: envType.isDev },
  ),
);
