import { z } from 'zod';

export function createLocalizedSchema<T extends z.ZodTypeAny>(
  schema: T,
  t: (key: string) => string,
): T {
  return schema.superRefine((data, ctx) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.message || issue.code;

        ctx.addIssue({
          ...issue,
          message: t(key) || 'Invalid input',
        });
      }
    }
  }) as T;
}
