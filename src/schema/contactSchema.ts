import * as v from 'valibot';
import type { ValidatorKeys } from '@/types/translations';
const getErrorKey = (v: ValidatorKeys) => v;

const NameSchema = v.pipe(
  v.string(),
  v.check((value) => !!value, getErrorKey('c_required')),
);

const EmailSchema = v.pipe(v.string(), v.email());

const MessageSchema = v.pipe(
  v.string(),
  v.check((value) => !!value, getErrorKey('c_required')),
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
