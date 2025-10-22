import { extractIssueKey } from '@/lib/validator/extractIssueKey';
import { resolveMessage } from '@/lib/validator/resolveMessage';
import { formDataToObject } from '@/utils/formDataToObject';
import { getLocale, getTranslations } from 'next-intl/server';
import * as v from 'valibot';

type ResultReturnError = Record<string, string[]>;
type ResultReturn = { success: boolean; errors?: ResultReturnError };
type OnSubmitReturn = { errors?: ResultReturnError };

type OnSubmit<TEntries extends v.ObjectEntries> = (
  data: v.InferOutput<v.ObjectSchema<TEntries, undefined>>,
  formData?: FormData,
) => Promise<OnSubmitReturn | void>;

type ActionConfig = { isAutoSuccessReturn: boolean };
const defaultConfig: ActionConfig = { isAutoSuccessReturn: true };

async function serverFormAction<TEntries extends v.ObjectEntries>(
  schema: v.ObjectSchema<TEntries, undefined>,
  onSubmit: OnSubmit<TEntries>,
  formData: FormData, // Re-created by Next from http request
  _config: ActionConfig,
): Promise<ResultReturn> {
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

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, errors: { _form: [error && error?.message] } };
  }
}

// Fabric
export function createFormAction<TEntries extends v.ObjectEntries>(
  schema: v.ObjectSchema<TEntries, undefined>,
  onSubmit: OnSubmit<TEntries>,
  config?: ActionConfig,
) {
  return async (formData: FormData) =>
    serverFormAction(schema, onSubmit, formData, config || defaultConfig);
}

export type ActionHandlerType = (formData: FormData) => Promise<ResultReturn>;
