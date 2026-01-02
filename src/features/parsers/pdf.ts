import type { TextItem, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { finalNormalizeText } from '../utils/normalizeText';
import { recognizeBlobs } from './recognize';
import { devLogger } from '@/lib/devLogger';

// Load worker on click -> lazy loading + error with next ssr
type PDFJsLibType = typeof import('pdfjs-dist');

/**
 * Lazy load PDF.js only when needed.
 * This fixes the SSR issue in Next.js (window is undefined)
 * and ensures that the library is ready before use.
 */
const initPdfJs = (() => {
  let pdfjsLib: PDFJsLibType | null = null;

  return async (): Promise<PDFJsLibType> => {
    if (pdfjsLib) return pdfjsLib;

    pdfjsLib = await import('pdfjs-dist');
    // Use unpkg instead of cdnjs for better version compatibility.
    // Also use .mjs because modern pdf.js uses ES modules.
    // const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;
    const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    return pdfjsLib;
  };
})();

const convertPdfPageToImage = async (pdf: PDFDocumentProxy, pageNumber: number): Promise<Blob> => {
  const page = await pdf.getPage(pageNumber);
  // scale: 2.0 — Optimal balance for OCR
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas context failed');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Conversion to Blob failed'));
    });
  });
};

export async function extractTextFromPDF(file: File): Promise<string> {
  const [arrayBuffer, pdfjsLib] = await Promise.all([file.arrayBuffer(), initPdfJs()]);

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      disableFontFace: false,
    });

    const pdf = await loadingTask.promise;

    // --- TRIAL 1: Extracting a text layer ---
    const pagePromises = Array.from({ length: pdf.numPages }, async (_, i) => {
      const pageNumber = i + 1;
      const page = await pdf.getPage(pageNumber);

      const content = await page.getTextContent({
        includeMarkedContent: true,
      });

      let pageText = content.items
        .map((item) => ('str' in item ? (item as TextItem).str : ''))
        .join(' ');

      // --- TRY 2: Check annotations/forms if text is empty ---
      if (!pageText.trim()) {
        // console.log(`Page ${pageNumber} empty, checking annotations...`);
        const annotations = await page.getAnnotations();
        const formText = annotations
          .map((an: Record<string, string>) => an.fieldValue || an.contents || '')
          .join(' ');

        if (formText.trim()) {
          pageText = formText;
        }
      }

      return pageText;
    });

    const pageTexts = await Promise.all(pagePromises);
    devLogger.log('PDF pageTexts: ', pageTexts);
    const fullText = pageTexts.join('\n\n');

    // Checking if we managed to extract anything
    // 50 characters is a heuristic. If less, it's either an empty file or a scan.
    const cleanedText = finalNormalizeText(fullText.replace(/-\s+/g, ''));

    if (cleanedText.length > 50) {
      devLogger.log('PDF text extracted natively.');
      return cleanedText;
    }

    // --- TRIAL 3: OCR FALLBACK (If text is missing or garbage) ---
    devLogger.warn('Native PDF extraction yielded little text. Switching to OCR fallback...');

    // 1. Render all pages into images (in parallel)
    const imagePromises = Array.from({ length: pdf.numPages }, (_, i) =>
      convertPdfPageToImage(pdf, i + 1),
    );
    const images = await Promise.all(imagePromises);

    // 2. Run Tesseract through our helper function
    const ocrText = await recognizeBlobs(images);
    devLogger.log('ocrText: ', ocrText);

    return finalNormalizeText(ocrText);
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error('failed_parse_pdf');
  }
}
