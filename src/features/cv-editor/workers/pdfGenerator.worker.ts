/**
 * PDF Generator Web Worker
 *
 * Message protocol:
 *   Incoming: PdfWorkerRequest  { document, template, font }
 *   Outgoing: PdfWorkerSuccess  { pdf: Uint8Array }
 *           | PdfWorkerError    { error: string }
 */

import React from 'react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { registerFonts, getFontFamily, type FontOption } from '../pdf/registerFonts';
import { AtsCleanTemplate } from '../pdf/AtsCleanTemplate';
import { AtsModernTemplate } from '../pdf/AtsModernTemplate';
import type { ResumeDocument } from '../schema/resumeDocument.schema';
import type { TemplateStyle } from '../store/templateSettingsStore';

export interface PdfWorkerRequest {
  document: ResumeDocument;
  template: TemplateStyle;
  font: FontOption;
  pageCount: number;
}

interface PdfWorkerSuccess {
  pdf: Uint8Array;
}
interface PdfWorkerError {
  error: string;
}
export type PdfWorkerResponse = PdfWorkerSuccess | PdfWorkerError;

function isPdfWorkerRequest(data: unknown): data is PdfWorkerRequest {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.document === 'object' &&
    d.document !== null &&
    (d.template === 'atsClean' || d.template === 'atsModern') &&
    (d.font === 'roboto' || d.font === 'ptSerif') &&
    typeof d.pageCount === 'number'
  );
}

self.addEventListener('message', async (event: MessageEvent<unknown>) => {
  if (!isPdfWorkerRequest(event.data)) {
    self.postMessage({ error: 'Invalid worker request payload.' } satisfies PdfWorkerError);
    return;
  }

  const { document: resumeDocument, template, font, pageCount } = event.data;

  registerFonts(font);
  const fontFamily = getFontFamily(font);

  try {
    const props = { document: resumeDocument, fontFamily, pageCount };
    const element = (
      template === 'atsModern'
        ? React.createElement(AtsModernTemplate, props)
        : React.createElement(AtsCleanTemplate, props)
    ) as React.ReactElement<DocumentProps>;

    const blob = await pdf(element).toBlob();
    const uint8 = new Uint8Array(await blob.arrayBuffer());

    (self as unknown as Worker).postMessage({ pdf: uint8 } satisfies PdfWorkerSuccess, [
      uint8.buffer,
    ]);
  } catch (err) {
    self.postMessage({
      error: err instanceof Error ? err.message : String(err),
    } satisfies PdfWorkerError);
  }
});
