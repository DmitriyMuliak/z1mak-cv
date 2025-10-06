import { z } from 'zod';

type ResultReturnError = Record<string, string[]>;
type ResultReturn = { success: boolean; errors?: ResultReturnError };
type OnSubmitReturn = { errors?: ResultReturnError };
type OnSubmit<T> = (
  data: z.ZodSafeParseResult<z.core.output<T>>,
  formData?: FormData,
) => Promise<OnSubmitReturn | void>;
type ActionConfig = { isAutoSuccessReturn: boolean };

const defaultConfig = { isAutoSuccessReturn: true };

async function serverFormAction<T extends z.ZodSchema>(
  schema: T,
  onSubmit: OnSubmit<T>,
  _config: ActionConfig,
  formData: FormData,
): Promise<ResultReturn> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    // TODO: use z.treeifyError instead of parsed.error.flatten()
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  console.log('✅ Valid data:', parsed.data);
  const result = await onSubmit(parsed, formData);

  if (result && result.errors) return { success: false, errors: result.errors };

  return { success: true };
}

export function createFormAction<T extends z.ZodSchema>(
  schema: T,
  onSubmit: OnSubmit<T>,
  config?: ActionConfig,
) {
  return serverFormAction.bind(null, schema, onSubmit, config || defaultConfig);
}
