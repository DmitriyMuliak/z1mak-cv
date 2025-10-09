import * as v from 'valibot';
import { valibotResolver as baseValibotResolver } from '@hookform/resolvers/valibot';
import type { TranslationFn, ValidatorKeys } from '@/types/translations';
import type { Resolver, FieldError } from 'react-hook-form';

type TPlaceholder = Record<string, string | number | Date>;
type CustomMessage<T extends string> = `${T}`; //  `c_${T}`;
const CustomMessagePrefix = 'c_';

/*
 * Function for map and change default messages from valibot
 * How they build (common & es6) modules - packages/i18n/scripts/build-npm.ts
 * All base error codes                  - packages/i18n/src/uk.ts
 */
export function localizedValibotResolver<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends v.BaseSchema<any, any, any>,
>(schema: TSchema, t: TranslationFn): Resolver<v.InferOutput<TSchema>> {
  const baseResolver = baseValibotResolver(schema);

  return async (values, context, options) => {
    const result = await baseResolver(values, context, options);

    if (result.errors) {
      for (const key of Object.keys(result.errors)) {
        const error = result.errors[key];

        if (!error) continue;

        const fieldError = error as FieldError & {
          ref?: { issue?: Record<string, unknown> };
        };
        const _code = (fieldError.type || 'custom') as ValidatorKeys;
        const message = fieldError.message || '';
        const isCustomError = message.startsWith(CustomMessagePrefix);
        const placeholders = fieldError.ref?.issue ?? {};

        if (isCustomError) {
          fieldError.message =
            t(`${message}` as CustomMessage<ValidatorKeys>, placeholders as TPlaceholder) ||
            fieldError.message;
        }
      }
    }

    return result;
  };
}
