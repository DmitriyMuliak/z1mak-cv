'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormField as FormFieldInternal,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';

interface FormFieldProps {
  name: string;
  placeholder?: string;
  children: React.ReactElement;
}

export function FormField({ name, placeholder, children }: FormFieldProps) {
  const form = useFormContext();

  return (
    <FormFieldInternal
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{placeholder || name}</FormLabel>
          {React.cloneElement(children, { ...field })}
          {fieldState.error && (
            <FormMessage className="text-destructive">{fieldState.error.message}</FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}
