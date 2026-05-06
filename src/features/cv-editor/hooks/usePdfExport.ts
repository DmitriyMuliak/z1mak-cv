'use client';

/**
 * usePdfExport
 *
 * React hook that offloads PDF generation to a Web Worker and triggers
 * a browser download when complete.
 *
 * Usage:
 *   const { exportPdf, isGenerating } = usePdfExport();
 *   await exportPdf(document, 'atsClean');
 */

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { ResumeDocument } from '../schema/resumeDocument.schema';
import type { PdfWorkerResponse } from '../workers/pdfGenerator.worker';
import type { TemplateStyle, SectionKey } from '../store/templateSettingsStore';
import { useTemplateSettingsStore } from '../store/templateSettingsStore';
import type { FontOption } from '../pdf/registerFonts';

export type { TemplateStyle, FontOption, SectionKey };

// ---------------------------------------------------------------------------
// Helper: derive a filename from the document header name
// ---------------------------------------------------------------------------

function buildFilename(doc: ResumeDocument, template: TemplateStyle): string {
  const safeName = doc.header.name
    ? doc.header.name
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '')
    : 'resume';
  const suffix = template === 'atsModern' ? 'modern' : 'clean';
  return `${safeName}_${suffix}.pdf`;
}

// ---------------------------------------------------------------------------
// Helper: trigger file download from a Uint8Array
// ---------------------------------------------------------------------------

function downloadUint8Array(bytes: Uint8Array, filename: string): void {
  // Cast to ArrayBuffer to satisfy strict Blob constructor typing in TS 5.x
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  // Revoke after a short tick to let the browser initiate the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  }, 100);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UsePdfExportReturn {
  isGenerating: boolean;
  exportPdf: (
    document: ResumeDocument,
    template: TemplateStyle,
    font: FontOption,
    pageCount: number,
    sectionOrder: SectionKey[][],
  ) => Promise<void>;
}

export function usePdfExport(): UsePdfExportReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations('cvEditor');

  const exportPdf = useCallback(
    async (
      doc: ResumeDocument,
      template: TemplateStyle,
      font: FontOption,
      pageCount: number,
      sectionOrder: SectionKey[][],
    ): Promise<void> => {
      const labels = {
        summary: t('preview.summary'),
        experience: t('preview.experience'),
        education: t('preview.education'),
        skills: t('preview.skills'),
        certifications: t('preview.certifications'),
        languages: t('preview.languages'),
        proficiencyLevels: {
          native: t('languages.proficiencyLevels.native'),
          fluent: t('languages.proficiencyLevels.fluent'),
          advanced: t('languages.proficiencyLevels.advanced'),
          intermediate: t('languages.proficiencyLevels.intermediate'),
          basic: t('languages.proficiencyLevels.basic'),
        },
      };

      setIsGenerating(true);
      try {
        await new Promise<void>((resolve, reject) => {
          const worker = new Worker(new URL('../workers/pdfGenerator.worker.ts', import.meta.url));

          worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
            worker.terminate();
            const data = event.data;
            if ('error' in data) {
              reject(new Error(data.error));
              return;
            }
            try {
              downloadUint8Array(data.pdf, buildFilename(doc, template));
              resolve();
            } catch (e) {
              reject(e);
            }
          };

          worker.onerror = (e: ErrorEvent) => {
            worker.terminate();
            reject(new Error(e.message || 'PDF worker error.'));
          };

          const sectionSettings = useTemplateSettingsStore.getState().sectionSettings;
          worker.postMessage({
            document: doc,
            template,
            font,
            pageCount,
            sectionOrder,
            labels,
            sectionSettings,
          });
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [t],
  );

  return { exportPdf, isGenerating };
}
