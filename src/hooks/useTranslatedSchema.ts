import { TranslationFn } from '@/types/translations';
import { useTranslations } from 'next-intl';

export const useTranslatedSchema = <T>(cb: (t: TranslationFn) => T): T => {
  const tZod = useTranslations('zod');
  return cb(tZod);
};

// export const getContactSchema = (t: TranslationFn) => {
//   const z = createLocalizedZod(t);
//   return z.object({
//     name: z.string().min(1)
//   });
// }

// const _defaultErrorCodes = new Set([
//   "invalid_type",
//   "too_big",
//   "too_small",
//   "invalid_string",
//   "invalid_string_format",
//   "not_multiple_of",
//   "unrecognized_keys",
//   "invalid_union",
//   "invalid_key",
//   "invalid_element",
//   "invalid_value",
//   "custom",
// ]);
