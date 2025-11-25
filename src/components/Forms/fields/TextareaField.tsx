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
  className?: string;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
}: TextareaFieldProps<T>) {
  return (
    <div className="relative" data-form-field-id={name}>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {label.length ? <FormLabel className="text-sm">{label}</FormLabel> : null}
            <FormControl>
              <Textarea
                placeholder={placeholder}
                {...field}
                className={cn(
                  'placeholder:text-foreground border-stone-950 dark:border-slate-400/20 text-gray-900 dark:text-white',
                  className,
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
