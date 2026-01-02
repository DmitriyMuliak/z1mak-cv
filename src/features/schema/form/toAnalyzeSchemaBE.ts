import * as v from 'valibot';
import { ToAnalyzeSchemaBase } from './common';

export const ToAnalyzeSchemaBE = v.object({
  ...ToAnalyzeSchemaBase.entries,
  cvConvertedText: v.optional(v.string()),
  jobConvertedText: v.optional(v.string()),
});

export type ToAnalyzeSchemaBEType = v.InferOutput<typeof ToAnalyzeSchemaBE>;
