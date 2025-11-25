import type { NamespaceKeys } from 'next-intl';
import type en from '../../messages/en.json';
import type { DeepKeyOf } from '@/types/utils';

export type MessagesBase = typeof en;
export type NameSpacedTranslationMessages = NamespaceKeys<MessagesBase, DeepKeyOf<MessagesBase>>;
export type ValidatorKeys = keyof MessagesBase['validator'];
export type TranslationFn = (
  key: ValidatorKeys,
  params?: Record<string, string | number | Date>, // params?: Record<string, unknown>,
) => string;
