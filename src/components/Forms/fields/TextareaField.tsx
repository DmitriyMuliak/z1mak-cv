'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Control, FieldValues, Path } from 'react-hook-form';

interface TextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: TextareaFieldProps<T>) {
  return (
    <div className="relative" data-form-field-id={name}>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">{label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={placeholder}
                {...field}
                className={cn(
                  'placeholder:text-foreground border-stone-950 dark:border-slate-400/20 text-gray-900 dark:text-white',
                )}
              />
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600 capitalize" />
          </FormItem>
        )}
      />
    </div>
  );
}
