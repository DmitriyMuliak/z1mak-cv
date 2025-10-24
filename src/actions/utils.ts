import { extractIssueKey } from '@/lib/validator/extractIssueKey';
import { resolveMessage } from '@/lib/validator/resolveMessage';
import { formDataToObject } from '@/utils/formDataToObject';
import { getLocale, getTranslations } from 'next-intl/server';
import * as v from 'valibot';

// Schema can be:
// BaseSchema || BaseSchemaAsync
// v.ObjectSchema<TEntries, undefined> || v.SchemaWithPipe<v.ObjectSchema<TEntries, undefined>, v.BaseIssue<unknown>>
type AnySchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

type ResultReturnError = Record<string, string[]>;
export type SuccessData = Record<string, unknown>;
export type ResultReturn<TData extends SuccessData | void = void> = {
  success: boolean;
  errors?: ResultReturnError;
  data?: TData;
};

type OnSubmitReturn<TData extends SuccessData | void = void> = {
  errors?: ResultReturnError;
  data?: TData;
};

type OnSubmit<TSchema extends AnySchema, TData extends SuccessData | void = void> = (
  data: v.InferOutput<TSchema>,
  formData?: FormData,
) => Promise<OnSubmitReturn<TData> | void>;

type ActionConfig = { isAutoSuccessReturn: boolean };
const defaultConfig: ActionConfig = { isAutoSuccessReturn: true };

async function serverFormAction<TSchema extends AnySchema, TData extends SuccessData | void = void>(
  schema: TSchema,
  onSubmit: OnSubmit<TSchema, TData>,
  formData: FormData, // Re-created by Next from http request
  _config: ActionConfig,
): Promise<ResultReturn<TData>> {
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

    const submitResult = await onSubmit(result.output, formData);

    if (submitResult?.errors) return { success: false, errors: submitResult.errors };

    return { success: true, data: submitResult?.data };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, errors: { _form: [error && error?.message] } };
  }
}

// Fabric
export function createFormAction<
  TSchema extends AnySchema,
  TData extends SuccessData | void = void,
>(schema: TSchema, onSubmit: OnSubmit<TSchema, TData>, config?: ActionConfig) {
  return async (formData: FormData) =>
    serverFormAction(schema, onSubmit, formData, config || defaultConfig);
}

export type ActionHandlerType<TData extends SuccessData | void = void> = (
  formData: FormData,
) => Promise<ResultReturn<TData>>;
