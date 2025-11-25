import type {
  ActionHandlerType,
  SuccessData,
  ResultReturn,
  CreateOnSubmitHandlerConfig,
} from '@/actions/utils';
import type { FieldValues, UseFormReturn, Path } from 'react-hook-form';

export const createOnSubmitHandler =
  <TFieldValues extends FieldValues, TData extends SuccessData | void = void, TFE = unknown>(
    actionHandler: ActionHandlerType<TData, TFE>,
    form: UseFormReturn<TFieldValues>,
    onResult?: (dataFromActionHandler: ResultReturn<TData>) => void,
    config?: CreateOnSubmitHandlerConfig<TFieldValues, TFE>,
  ) =>
  async (data: TFieldValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'object' && value !== null) {
        formData.append(key, String(value));
        return;
      }

      if (value && Array.isArray(value)) {
        if (
          value.length &&
          typeof value[0] === 'object' &&
          (value[0] as { file?: File }).file instanceof File
        ) {
          (value as { file: File }[]).forEach((fileContainer) => {
            formData.append(key, fileContainer.file, fileContainer.file.name);
          });
          return;
        } else {
          value.forEach((keyValue) => {
            formData.append(key, String(keyValue));
          });
          return;
        }
      }

      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof File) &&
        !(value instanceof Blob)
      ) {
        throw new Error(
          `Unsupported nested object in form data at key: ${key}. Need add flatten & unflatten logic + check {file: File} structure.`,
        );
      }
    });

    const additionalFEData = config?.getAdditionalFEData
      ? config.getAdditionalFEData(data)
      : undefined;

    const res = await actionHandler(formData, additionalFEData);

    if (onResult) {
      onResult(res);
    }

    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) =>
        form.setError(field as Path<TFieldValues>, { message: (messages as [string]).join(', ') }),
      );
    }

    if (res.success) form.reset();
  };

export type SimpleActionHandlerType<
  TFormData extends FieldValues,
  TData extends SuccessData | void = void,
  TFE = unknown,
> = (formData: TFormData, additionalFEData?: TFE) => Promise<ResultReturn<TData>>;

export const createBaseOnSubmitHandler =
  <TFieldValues extends FieldValues, TData extends SuccessData | void = void, TFE = unknown>(
    actionHandler: SimpleActionHandlerType<TFieldValues, TData, TFE>,
    form: UseFormReturn<TFieldValues>,
    onResult?: (dataFromActionHandler: ResultReturn<TData>) => void,
    config?: CreateOnSubmitHandlerConfig<TFieldValues, TFE>,
  ) =>
  async (data: TFieldValues) => {
    const additionalFEData = config?.getAdditionalFEData
      ? config.getAdditionalFEData(data)
      : undefined;

    const res = await actionHandler(data, additionalFEData);

    if (onResult) {
      onResult(res);
    }

    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) =>
        form.setError(field as Path<TFieldValues>, { message: (messages as [string]).join(', ') }),
      );
    }

    if (res.success) form.reset();
  };
