import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';

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
  file: v.any(),
});

const BaseContactSchema = v.object({
  name: NameSchema,
  email: EmailSchema,
  message: MessageSchema,
  files: v.optional(v.array(FileSchema)),
});

export const ContactSchema = v.required(BaseContactSchema, ['name', 'email']);

export type ContactSchemaType = v.InferOutput<typeof ContactSchema>;
