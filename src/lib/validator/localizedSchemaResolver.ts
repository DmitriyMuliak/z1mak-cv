import * as v from 'valibot';
import { valibotResolver as baseValibotResolver } from '@hookform/resolvers/valibot';
import type { TranslationFn } from '@/types/translations';
import type { Resolver } from 'react-hook-form';
// import type { TranslationFn, ValidatorKeys } from '@/types/translations';
// import type { Resolver, FieldError } from 'react-hook-form'

/*
 * Function for map and change default messages from valibot
 * How they build (common & es6) modules - packages/i18n/scripts/build-npm.ts
 * All base error codes                  - packages/i18n/src/uk.ts
 */
// export function localizedValibotResolver<
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   TSchema extends v.BaseSchema<any, any, any>
// >(
//   schema: TSchema,
//   t: TranslationFn
// ): Resolver<v.InferOutput<TSchema>> {
//   const baseResolver = baseValibotResolver(schema)

//   return async (values, context, options) => {
//     const result = await baseResolver(values, context, options)

//     if (result.errors) {
//       for (const key of Object.keys(result.errors)) {
//         const error = result.errors[key]

//         if (!error) continue

//         const fieldError = error as FieldError & {
//           ref?: { issue?: Record<string, unknown> }
//         }

//         const code = (fieldError.type || 'custom') as ValidatorKeys;
//         const placeholders = fieldError.ref?.issue ?? {}

//         fieldError.message =
//           t(`${code}`, placeholders) ||
//           fieldError.message ||
//           t('custom')
//       }
//     }

//     return result
//   }
// }

export function localizedValibotResolver<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends v.BaseSchema<any, any, any>,
>(schema: TSchema, _t: TranslationFn): Resolver<v.InferOutput<TSchema>> {
  const baseResolver = baseValibotResolver(schema);

  return async (values, context, options) => {
    const result = await baseResolver(values, context, options);

    return result;
  };
}
