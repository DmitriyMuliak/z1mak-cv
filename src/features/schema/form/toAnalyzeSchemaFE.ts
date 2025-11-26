import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';
import { allowedCvFilesMimeTypes } from './common';

const OneMbInKb = 1048576;
const MAX_SIZE = OneMbInKb * 5;
const MAX_SIZE_MB = (MAX_SIZE / 1024 / 1024).toFixed();
const MAX_TEXT_LENGTH = 6000;

const BaseStringSchema = v.pipe(
  v.string(),
  v.maxLength(MAX_TEXT_LENGTH, createMessageHandler('c_max_length')),
);

const RequiredStringSchema = v.pipe(
  BaseStringSchema,
  v.minLength(1, createMessageHandler('c_required')),
);

const OptionalStringSchema = v.optional(BaseStringSchema);

const fileValidationPipe = [
  v.check(
    (file: File) => allowedCvFilesMimeTypes.includes(file.type),
    createMessageHandler('file_invalid_type'),
  ),
  v.check(
    (file: File) => file.size <= Number(MAX_SIZE),
    (issue) => {
      const issueResolver = createMessageHandler('c_file_too_large');
      return issueResolver({ ...issue, expected: `${MAX_SIZE_MB}` });
    },
  ),
] as const;

const isClient = typeof window !== 'undefined' && typeof File !== 'undefined';

const FileSchemaFE = isClient
  ? v.object({
      file: v.pipe(v.instance(File, createMessageHandler('file_problem')), ...fileValidationPipe),
    })
  : v.object({
      file: v.any(),
    });

const FilesSchemaRequired = v.pipe(
  v.array(FileSchemaFE),
  v.minLength(1, createMessageHandler('c_required')),
);

const FilesSchemaOptional = v.optional(v.array(FileSchemaFE));

const AlwaysValidSchema = v.optional(v.any()); // in case of evaluationMode === mode, skip validation

export type ValidationState = {
  evaluationMode: 'general' | 'byJob';
  addCvBy: 'text' | 'file';
  addJobBy: 'text' | 'file';
};

export const getSendToAnalyzeSchema = (state: ValidationState) => {
  const { evaluationMode, addCvBy, addJobBy } = state;
  const isJobMode = evaluationMode === 'byJob';

  return v.object({
    // CV Logic
    cvText: addCvBy === 'text' ? RequiredStringSchema : OptionalStringSchema,
    cvFile: addCvBy === 'file' ? FilesSchemaRequired : FilesSchemaOptional,

    // Job Logic
    jobText: isJobMode && addJobBy === 'text' ? RequiredStringSchema : AlwaysValidSchema,
    jobFile: isJobMode && addJobBy === 'file' ? FilesSchemaRequired : AlwaysValidSchema,
  });
};

export type SendToAnalyzeFEType = v.InferOutput<ReturnType<typeof getSendToAnalyzeSchema>>;
