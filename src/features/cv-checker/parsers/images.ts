import { recognizeBlobs } from './recognize';

export const extractTextFromImages = async (file: File): Promise<string> => {
  try {
    return await recognizeBlobs([file]);
  } catch (error) {
    console.error('Image OCR failed:', error);
    throw new Error('failed_parse_image_ocr');
  }
};
