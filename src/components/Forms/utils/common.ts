import type { FormState, FieldValues } from 'react-hook-form';

/**
 *
 * This util add 'message' key to array with nested errors.
 * example of flat error:
 * { email: {message: 'Неправильний email: отримано ""', type: 'email', ref: undefined} }
 * example of nested error:
 * {
 *  files: [
 *    {
 *      name: {message: 'Неправильний тип: очікувався "name", але отримано undefined', type: 'object', ref: undefined}
 *      size: {message: 'Неправильний тип: очікувався "size", але отримано undefined', type: 'object', ref: undefined}
 *    }
 *  ]
 * }
 * @returns files && files.message = files[number], files[number + 1];
 */
export const mergeNestedErrorsInOneMessage = <T extends FieldValues = FieldValues>(
  errors: FormState<T>['errors'],
) => {
  Object.keys(errors).map((key) => {
    const error = errors[key];
    if (Array.isArray(error)) {
      const errorMessages = error.flatMap((err) =>
        Object.values(err).map((e) => (e as Record<string, string>)?.message),
      );
      error.message = errorMessages.join(', ');
    }
    return error;
  });
};
