import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';
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

export const fileSchemaPipe = () => [
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

export const BaseContactSchema = v.object({
  name: NameSchema,
  email: EmailSchema,
  message: MessageSchema,
});
