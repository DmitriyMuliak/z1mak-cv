'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Control, FieldValues, Path } from 'react-hook-form';

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
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
