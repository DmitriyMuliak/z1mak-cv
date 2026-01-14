import { extractTextFromDocx } from './docx';
import { extractTextFromPDF } from './pdf';
import { extractTextFromTxt } from './txt';
import { extractTextFromImages } from './images';

export async function parseFile(file: File) {
  if (file.name.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }

  if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    return extractTextFromDocx(file);
  }

  if (file.name.endsWith('.jpeg') || file.name.endsWith('.png') || file.name.endsWith('.jpg')) {
    return extractTextFromImages(file);
  }

  if (file.name.endsWith('.txt')) {
    return extractTextFromTxt(file);
  }

  throw new Error('unsupported_file_type');
}
