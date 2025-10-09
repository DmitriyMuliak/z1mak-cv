'use client';

import { ReactNode } from 'react';
import { useForm, FormProvider, FieldValues, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { cn } from '@/lib/utils';

// TODO: Fix types -> move from zod to valibot

interface FormClientProviderProps<T extends z.ZodType> {
  schema: T;
  defaultValues: z.infer<T>;
  action: (formData: FormData) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormClientProvider<T extends z.ZodType<any, any, any>>({
  schema,
  defaultValues,
  action,
  children,
}: FormClientProviderProps<T>) {
  type FormValuesType = z.infer<T>;

  type FormValues = z.infer<T>;
  const resolver = zodResolver(schema) as unknown as Resolver<FormValues>;

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
