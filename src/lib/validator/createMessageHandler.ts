import { ValidationKeys } from '@/types/translations';
import { ValidatorPlaceholders } from './consts';
import { createCustomKey, createTempCustomMessage } from './createTempCustomMessage';
import type { BaseIssue } from 'valibot';
type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

const extractPlaceholdersFromIssue = <T>(issue: BaseIssue<T>): Partial<Writable<BaseIssue<T>>> => {
  return (Object.keys(issue) as (keyof BaseIssue<T>)[]).reduce(
    (acc, key) => {
      if (ValidatorPlaceholders[key as keyof typeof ValidatorPlaceholders]) {
        // @ts-expect-error Writable TS field issue
        acc[key] = issue[key] as Writable<BaseIssue<T>>[typeof key];
      }
      return acc;
    },
    {} as Partial<Writable<BaseIssue<T>>>,
  );
};

export const createMessageHandler =
  (key: ValidationKeys) =>
  <T>(issue: BaseIssue<T>) => {
    return createTempCustomMessage(key, extractPlaceholdersFromIssue(issue));
  };

export const createSimpleMessageHandler =
  (key: ValidationKeys) =>
  <T>(_issue: BaseIssue<T>) => {
    return createCustomKey(key);
  };

export const createSimpleMessage = (key: ValidationKeys) => createCustomKey(key);
