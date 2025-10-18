import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';
// import { allowedContactFilesMimeTypes } from './consts';

const _ExampleNameSchema = v.pipe(
  v.string(),
  v.minLength(5, createMessageHandler('specificNameKey')),
);

const _ExampleOfExtendSchema = v.object({
  // ...BaseContactSchema.entries,
});

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
  name: v.string(),
  type: v.string(), // mimetype
  size: v.number(),
});

const FilesSchema = v.optional(
  v.array(
    v.pipe(
      FileSchema,
      // v.check(
      //   (file) => allowedContactFilesMimeTypes.includes(file.type),
      //   (input) => `Invalid file type: ${(input as any)?.type || 'unknown'}`
      // ),
      // v.check(
      //   (file) => file.size <= 5 * 1024 * 1024, // до 5MB, якщо треба
      //   (input) => `File too large: ${(input as any)?.name || 'unknown'}`
      // )
    ),
  ),
);

const BaseContactSchema = v.object({
  name: NameSchema,
  email: EmailSchema,
  message: MessageSchema,
  files: FilesSchema,
});

export const ContactSchema = v.required(BaseContactSchema, ['name', 'email']);

export type ContactSchemaType = v.InferOutput<typeof ContactSchema>;
