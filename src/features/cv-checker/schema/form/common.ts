import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';

export const cvFileTypes = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
} as const;

export const allowedCvFilesMimeTypes = Object.keys(cvFileTypes);

const TextSchemaBase = v.pipe(v.string(), v.maxLength(5000, createMessageHandler('c_max_length')));

const TextSchema = v.pipe(v.union([TextSchemaBase, v.undefined()]));

export const ToAnalyzeSchemaBase = v.object({
  cvText: TextSchema,
  jobText: TextSchema,
});

export type SendToAnalyzeBaseType = v.InferOutput<typeof ToAnalyzeSchemaBase>;
