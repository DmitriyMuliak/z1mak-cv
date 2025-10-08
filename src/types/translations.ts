import type { NamespaceKeys } from 'next-intl';
import type en from '../../messages/en.json';
import type { DeepKeyOf } from '@/types/utils';

type MessagesBase = typeof en;
export type NameSpacedTranslationMessages = NamespaceKeys<MessagesBase, DeepKeyOf<MessagesBase>>;
export type ZodTranslationKeys = keyof MessagesBase['zod'];
export type TranslationFn = (
  key: ZodTranslationKeys,
  params?: Record<string, string | number | Date> | undefined,
) => string;
