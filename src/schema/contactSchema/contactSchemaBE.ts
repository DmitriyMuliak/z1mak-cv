import * as v from 'valibot';
import { createMessageHandler, createSimpleMessage } from '@/lib/validator/createMessageHandler';
import { BaseContactSchema, fileSchemaPipe } from './common';

const isFileObject = (input: unknown): input is File => {
  return (
    typeof input === 'object' &&
    input !== null &&
    'size' in input &&
    'type' in input &&
    typeof input.size === 'number' &&
    typeof input.type === 'string'
  );
};

const FileSchemaBE = v.pipe(
  v.custom<File>(isFileObject, createMessageHandler('file_problem')),
  ...fileSchemaPipe(),
);

const FilesSchemaBE = v.optional(v.union([v.array(FileSchemaBE), FileSchemaBE]));

export const ContactSchemaBaseBE = v.object({
  ...BaseContactSchema.entries,
  files: FilesSchemaBE,
  recaptchaToken: v.optional(v.string()),
});

export const ContactSchemaBE = v.pipe(
  ContactSchemaBaseBE,
  v.rawCheck(({ dataset, addIssue }) => {
    const data = dataset.value as ContactSchemaBEType;
    const hasFiles = !!(Array.isArray(data.files) ? data.files.length > 0 : data.files);
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

export type ContactSchemaBEType = v.InferOutput<typeof ContactSchemaBaseBE>;
