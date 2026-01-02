import * as v from 'valibot';
import { createMessageHandler, createSimpleMessage } from '@/lib/validator/createMessageHandler';
import { BaseContactSchema, fileSchemaPipe } from './common';

const isClient = typeof window !== 'undefined' && typeof File !== 'undefined';

const FileSchemaFE = isClient
  ? v.object({
      file: v.pipe(v.instance(File, createMessageHandler('file_problem')), ...fileSchemaPipe()),
    })
  : v.object({
      file: v.any(), // SSR fallback
    });

const FilesSchemaFE = v.pipe(v.optional(v.array(FileSchemaFE)));

export const ContactSchemaBaseFE = v.object({
  ...BaseContactSchema.entries,
  files: FilesSchemaFE,
  recaptchaToken: v.optional(v.union([v.string(), v.null()])),
});

export const ContactSchemaFE = v.pipe(
  ContactSchemaBaseFE,
  v.rawCheck(({ dataset, addIssue }) => {
    const data = dataset.value as ContactSchemaFEType;
    const hasFiles = Array.isArray(data.files) && data.files.length > 0;
    if (hasFiles && !data.recaptchaToken) {
      addIssue({
        path: [
          {
            type: 'object',
            key: 'recaptchaToken',
            origin: 'value',
            input: data,
            value: data.recaptchaToken,
          } satisfies v.IssuePathItem,
        ],
        message: createSimpleMessage('captchaRequired'),
      });
    }
  }),
);

export type ContactSchemaFEType = v.InferOutput<typeof ContactSchemaFE>;
