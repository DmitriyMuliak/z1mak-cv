import * as v from 'valibot';
import { createMessageHandler, createSimpleMessage } from '@/lib/validator/createMessageHandler';
import { allowedContactFilesMimeTypes } from './consts';

const OneMbInKb = 1048576;
const MAX_SIZE = OneMbInKb;
const MAX_SIZE_MB = (MAX_SIZE / 1024 / 1024).toFixed();

const NameSchema = v.pipe(
  v.string(),
  v.check((value) => !!value, createMessageHandler('c_required')),
);

const EmailSchema = v.pipe(v.string(), v.email());

const MessageSchema = v.pipe(
  v.string(),
  v.check((value) => !!value, createMessageHandler('c_required')),
);

const fileSchemaPipe = () => [
  v.check(
    (file: File) => allowedContactFilesMimeTypes.includes(file.type),
    createMessageHandler('file_invalid_type'),
  ),
  v.check(
    (file: File) => file.size <= Number(MAX_SIZE),
    (issue) => {
      const issueResolver = createMessageHandler('c_file_too_large');
      const message = issueResolver({ ...issue, expected: `${MAX_SIZE_MB}` });
      return message;
    },
  ),
];

const BaseContactSchema = v.object({
  name: NameSchema,
  email: EmailSchema,
  message: MessageSchema,
});

const FileSchemaFE = v.object({
  file: v.pipe(v.instance(File, createMessageHandler('file_problem')), ...fileSchemaPipe()),
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
    const data = dataset.value as ContactSchemaFEType;
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

export type ContactSchemaFEType = v.InferOutput<typeof ContactSchemaFE>;
