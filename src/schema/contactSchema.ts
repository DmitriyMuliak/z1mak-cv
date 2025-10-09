import * as v from 'valibot';

const NameSchema = v.pipe(v.string(), v.minLength(1));

const EmailSchema = v.pipe(v.string(), v.email());

const MessageSchema = v.pipe(v.string(), v.minLength(5));

const FileSchema = v.object({
  file: v.any(),
});

export const ContactSchema = v.object({
  name: NameSchema,
  email: EmailSchema,
  message: MessageSchema,
  files: v.optional(v.array(FileSchema)),
});

export type ContactSchemaType = v.InferOutput<typeof ContactSchema>;
