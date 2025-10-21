import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';
import { allowedContactFilesMimeTypes } from './consts';

const OneMbInKb = 1048576;
const MAX_SIZE = OneMbInKb * 10;
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

const FileSchema = v.object({
  file: v.pipe(
    v.instance(File, createMessageHandler('file_problem')),
    v.check(
      (file) => allowedContactFilesMimeTypes.includes(file.type),
      createMessageHandler('file_invalid_type'),
    ),
    v.check(
      (file) => file.size <= Number(MAX_SIZE),
      (issue) => {
        const issueResolver = createMessageHandler('c_file_too_large');
        const message = issueResolver({ ...issue, expected: `${MAX_SIZE_MB}` });
        return message;
      },
    ),
  ),
});

const FilesSchema = v.pipe(v.optional(v.array(FileSchema)));

const BaseContactSchema = v.object({
  name: NameSchema,
  email: EmailSchema,
  message: MessageSchema,
  files: FilesSchema,
});

export const ContactSchema = v.required(BaseContactSchema, ['name', 'email', 'message']);
export const ContactSchemaBE = v.object({
  ...BaseContactSchema.entries,
  files: v.optional(
    v.union([
      v.array(v.any()),
      v.any(), // TODO: add validation for files -> can be arr or single file
    ]),
  ),
});

export type ContactSchemaType = v.InferOutput<typeof ContactSchema>;
