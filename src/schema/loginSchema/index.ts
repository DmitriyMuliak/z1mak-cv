import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';

const PasswordSchema = v.pipe(
  v.string(),
  v.check((value) => !!value, createMessageHandler('c_required')),
  v.minLength(8, createMessageHandler('c_min_length')),
);

const NameSchema = v.pipe(
  v.string(),
  v.check((value) => !!value, createMessageHandler('c_required')),
);

const EmailSchema = v.pipe(v.string(), v.email());

export const SignInSchemaBase = v.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type SignInSchemaBaseType = v.InferOutput<typeof SignInSchemaBase>;

export const SignUpSchemaBase = v.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export type SignUpSchemaBaseType = v.InferOutput<typeof SignUpSchemaBase>;

export const RequestResetPasswordSchemaBase = v.object({
  email: EmailSchema,
});

export type RequestResetPasswordSchemaBaseType = v.InferOutput<
  typeof RequestResetPasswordSchemaBase
>;

export const SetPasswordSchemaBase = v.pipe(
  v.object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      createMessageHandler('c_two_passwords_not_match'),
    ),
    ['confirmPassword'],
  ),
);

export type SetPasswordSchemaBaseType = v.InferOutput<typeof SetPasswordSchemaBase>;
