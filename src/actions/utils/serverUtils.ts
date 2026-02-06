import { unstable_rethrow } from 'next/navigation';
import * as v from 'valibot';
import { devLogger } from '@/lib/devLogger';
import { extractIssueKey } from '@/lib/validator/extractIssueKey';
import { resolveMessage } from '@/lib/validator/resolveMessage';
import { formDataToObject } from '@/utils/formDataToObject';
import { getLocale, getTranslations } from 'next-intl/server';

// Schema can be:
// BaseSchema || BaseSchemaAsync
// v.ObjectSchema<TEntries, undefined> || v.SchemaWithPipe<v.ObjectSchema<TEntries, undefined>, v.BaseIssue<unknown>>
type AnySchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

type ResultReturnMetaError = Partial<Record<string, unknown>>;
type ResultReturnError = Partial<Record<string, string[]>>; // Partial need for TS correctly infer super return type after couple of object returns with different keys
export type SuccessData = Record<string, unknown> | void; // Data or void when we don't return anything from action
export type ResultReturn<TData extends SuccessData | void = void> = {
  success: boolean;
  data?: TData;
  errors?: ResultReturnError;
  metaErrors?: ResultReturnMetaError;
  metaError?: string;
};

type OnSubmitReturn<TData extends SuccessData | void = void> = {
  data?: TData;
  errors?: ResultReturnError;
  metaErrors?: ResultReturnMetaError;
  metaError?: string;
};

type OnSubmit<TSchema extends AnySchema, TData extends SuccessData | void = void, TFE = unknown> = (
  data: v.InferOutput<TSchema>,
  formData: FormData,
  additionalFEData: TFE | undefined,
) => Promise<OnSubmitReturn<TData> | void>;

type ActionConfig = { isAutoSuccessReturn: boolean };
const defaultConfig: ActionConfig = { isAutoSuccessReturn: true };

async function serverFormAction<
  TSchema extends AnySchema,
  TData extends SuccessData | void = void,
  TFE = unknown,
>(
  schema: TSchema,
  onSubmit: OnSubmit<TSchema, TData, TFE>,
  formData: FormData, // Re-created by Next from http request
  additionalFEData: TFE | undefined,
  _config: ActionConfig,
): Promise<ResultReturn<TData>> {
  'use server';
  const locale = await getLocale();
  const t = await getTranslations({ namespace: 'validator', locale });
  const raw = formDataToObject(formData);

  try {
    const result = v.safeParse(schema, raw);

    if (!result.success) {
      const errors: ResultReturnError = {};
      for (const issue of result.issues) {
        const key = extractIssueKey(issue);
        if (!errors[key]) errors[key] = [];
        errors[key].push(resolveMessage(issue.message, t));
      }

      return { success: false, errors };
    }

    const submitResult = await onSubmit(result.output, formData, additionalFEData);

    // 'errors' will be set as form errors, metaErrors and metaError will not effect form state
    if (submitResult?.errors || submitResult?.metaErrors || submitResult?.metaError)
      return { success: false, ...submitResult };

    return { success: true, data: submitResult?.data };
  } catch (error: unknown) {
    devLogger.error('Form Unexpected error', error);
    unstable_rethrow(error);
    return {
      success: false,
      metaError: 'unexpectedTryLater',
    };
  }
}

// Fabric
export function createFormAction<
  TSchema extends AnySchema,
  TData extends SuccessData | void = void,
  TFE = unknown,
>(schema: TSchema, onSubmit: OnSubmit<TSchema, TData, TFE>, config?: ActionConfig) {
  return async (formData: FormData, additionalFEData?: TFE) =>
    serverFormAction(schema, onSubmit, formData, additionalFEData, config || defaultConfig);
}

export type ActionHandlerType<TData extends SuccessData | void = void, TFE = unknown> = (
  formData: FormData,
  additionalFEData?: TFE,
) => Promise<ResultReturn<TData>>;

// Example of add type to on success callback:
// type TDataFromAction = Awaited<ReturnType<typeof sendContactAction>> extends { success: true, data: infer D } ? D : void;
// type TData = Awaited<ReturnType<typeof sendContactAction>>;
// const onSuccessCb = (data: TData) => data;

type FieldErrors<T> = Partial<Record<keyof T, string[]>>;

export type ActionReturn<T> = Promise<{
  success: boolean;
  errors: FieldErrors<T>;
} | void>;

export interface CreateOnSubmitHandlerConfig<TFieldValues, T = unknown> {
  getAdditionalFEData?: (data: TFieldValues) => T;
}
