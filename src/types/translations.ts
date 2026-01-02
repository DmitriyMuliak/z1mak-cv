import type { MessageKeys, NestedKeyOf } from 'next-intl';
import type en from '../../messages/en.json';

export type MessagesBase = typeof en;

export type NamespacedRelativeMessageKeys<TObj extends object, TNamespace extends string> =
  MessageKeys<TObj, NestedKeyOf<TObj>> extends infer AllMessageKeys
    ? AllMessageKeys extends `${TNamespace}.${infer RelativeKey}`
      ? RelativeKey
      : never
    : never;

export type ValidatorKeys = keyof MessagesBase['validator'];

export type TranslationValidatorFn = (
  key: ValidatorKeys,
  params?: Record<string, string | number | Date>, // params?: Record<string, unknown>,
) => string;
