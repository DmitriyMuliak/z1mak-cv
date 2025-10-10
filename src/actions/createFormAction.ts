import { extractIssueKey } from '@/lib/validator/extractIssueKey';
import { formDataToObject } from '@/utils/formDataToObject';
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
  formData: FormData,
  _config: ActionConfig,
): Promise<ResultReturn> {
  const raw = formDataToObject(formData);

  try {
    const result = v.safeParse(schema, raw);

    if (!result.success) {
      const errors: ResultReturnError = {};
      for (const issue of result.issues) {
        const key = extractIssueKey(issue);
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return { success: false, errors };
    }

    const submitResult = await onSubmit(result.output, formData);
    if (submitResult?.errors) return { success: false, errors: submitResult.errors };

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, errors: { _form: [error.message] } };
  }
}

// Fabric
export function createFormAction<TEntries extends v.ObjectEntries>(
  schema: v.ObjectSchema<TEntries, undefined>,
  onSubmit: OnSubmit<TEntries>,
  config?: ActionConfig,
) {
  return (formData: FormData) =>
    serverFormAction(schema, onSubmit, formData, config || defaultConfig);
}
