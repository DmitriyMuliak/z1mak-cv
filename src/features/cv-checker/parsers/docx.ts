import { finalNormalizeText } from '../utils/normalizeText';

export const extractTextFromDocx = (file: File): Promise<string> =>
  new Promise(async (resolve, reject) => {
    const buffer = await file.arrayBuffer();
    const worker = new Worker('/docxWorker.js'); // from public folder

    worker.postMessage({ buffer });

    worker.onmessage = (e) => {
      const { text, error } = e.data;
      if (error) reject(error);
      else resolve(finalNormalizeText(text));
      worker.terminate();
    };
  });
