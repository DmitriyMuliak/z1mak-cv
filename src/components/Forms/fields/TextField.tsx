'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string | ReactNode;
  placeholder?: string;
  type?: string;
  inputClassName?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  inputClassName,
}: TextFieldProps<T>) {
  return (
    <div className="relative" data-form-field-id={name}>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">{label}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={cn(
                  'placeholder:text-foreground border-stone-950 dark:border-slate-400/20 text-gray-900 dark:text-white',
                  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                  'aria-invalid:border-red-700',
                  'dark:aria-invalid:border-red-700',
                  'transition-colors',
                  inputClassName,
                )}
              />
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600" />
          </FormItem>
        )}
      />
    </div>
  );
}

export const defaultInputStyles = 'placeholder:text-muted-foreground border-input text-foreground';
