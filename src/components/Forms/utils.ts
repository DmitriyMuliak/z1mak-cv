import type { ActionHandlerType } from '@/actions/utils';
import type { FormState, FieldValues, UseFormReturn, Path } from 'react-hook-form';

export const createOnSubmitHandler =
  <TFieldValues extends FieldValues>(
    actionHandler: ActionHandlerType,
    form: UseFormReturn<TFieldValues>,
  ) =>
  async (data: TFieldValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'object' && value !== null) formData.append(key, value);
      if (value && Array.isArray(value)) {
        if (value.length && value[0].file) {
          value.forEach((fileContainer) => {
            formData.append(key, fileContainer.file, fileContainer.file.name);
          });
        }
      }
    });

    const res = await actionHandler(formData);

    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) =>
        form.setError(field as Path<TFieldValues>, { message: messages.join(', ') }),
      );
    }

    if (res.success) form.reset();
  };

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
