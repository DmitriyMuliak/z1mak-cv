import { finalNormalizeText } from '../utils/normalizeText';

export const extractTextFromTxt = async (file: File): Promise<string> => {
  let text = '';

  // Attempt 1: Standard reading (UTF-8)
  // Most modern files will be here
  try {
    text = await file.text();
  } catch (e) {
    console.warn('Failed to read text as UTF-8', e);
  }

  // Check for "bit" encoding (crakozyabry)
  // Symbol (Replacement Character) often occurs when decoding UTF-8 error
  if (text.includes('')) {
    console.info('Detecting broken encoding, trying Windows-1251...');
    try {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('windows-1251');
      const decodedText = decoder.decode(buffer);

      text = decodedText;
    } catch (e) {
      console.error('Failed to decode as Windows-1251', e);
    }
  }

  return finalNormalizeText(text);
};
