import { createWorker, type Worker } from 'tesseract.js';

/**
 * OCR util
 * A general-purpose function for recognizing an array of Blobs (or files).
 * Used for both images and as a fallback for PDF.
 */
export const recognizeBlobs = async (
  blobs: (Blob | File)[],
  lang: string = 'ukr+eng',
  logger: (m: unknown) => void = () => {},
): Promise<string> => {
  let worker: Worker | null = null;

  try {
    worker = await createWorker(lang, 1, { logger });

    const textResults: string[] = [];

    // Tesseract processes sequentially
    for (const blob of blobs) {
      const { data } = await worker.recognize(blob);
      textResults.push(data.text);
    }

    await worker.terminate();
    return textResults.join('\n\n');
  } catch (error) {
    if (worker) {
      await worker.terminate();
    }
    throw error;
  }
};
