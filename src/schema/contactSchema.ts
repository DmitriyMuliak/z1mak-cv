import { z } from 'zod';
import { TranslationFn } from '@/types/translations';
import { returnValue } from '@/utils/returnValue';

export const getContactSchema = (t: TranslationFn) => {
  return z.object({
    name: z.string().min(1, { error: t('required') }), // name: z.string().refine(val => isNaN(Number(val)), { error: 'Ім’я має бути рядком' })
    email: z.email({ error: t('invalid_email') }),
    message: z.string().min(5, { error: t('message_too_short') }),
    files: z.array(z.object({ file: z.any() })).optional(), // files: z.array(z.object({ file: z.instanceof(File) })),
  });
};

export type FrontContactFormType = z.infer<ReturnType<typeof getContactSchema>>;

export const ContactSchema = getContactSchema(returnValue);
