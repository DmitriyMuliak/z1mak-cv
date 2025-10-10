'use client';

import { ReactNode } from 'react';
import { useForm, FormProvider, FieldValues, Resolver } from 'react-hook-form';
import { cn } from '@/lib/utils';

// TODO: Fix types -> move from zod to valibot

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodType = any;

interface FormClientProviderProps<T extends ZodType> {
  schema: T;
  defaultValues: ZodType;
  action: (formData: FormData) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  children: ReactNode;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const valibotResolver = (_args: any) => {};

export function FormClientProvider<T extends ZodType>({
  schema,
  defaultValues,
  action,
  children,
}: FormClientProviderProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type FormValuesType = any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type FormValues = any;
  const resolver = valibotResolver(schema) as unknown as Resolver<FormValues>;

  const form = useForm<FormValuesType & FieldValues>({
    resolver,
    mode: 'onBlur',
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value as string));

    const res = await action(formData);

    if (res.errors) {
      Object.entries(res.errors).forEach(([field, messages]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setError(field as any, { type: 'server', message: messages?.join(', ') });
      });
    }

    if (res.success) form.reset();
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={cn('grid', 'gap-3')}>
        {children}
      </form>
    </FormProvider>
  );
}
