'use client';

import { TurnstileCaptcha } from '@/components/TurnstileCaptcha';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { CSSProperties } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';

interface TurnstileCaptchaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  formName: string;
  containerStyle?: CSSProperties;
  containerClassName?: string;
}

export function TurnstileCaptchaField<T extends FieldValues>({
  control,
  name,
  formName,
  containerStyle,
  containerClassName,
}: TurnstileCaptchaProps<T>) {
  return (
    <div className="relative" data-form-field-id={name}>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <TurnstileCaptcha
                onVerify={field.onChange}
                actionName={formName}
                containerClassName={containerClassName}
                containerStyle={containerStyle}
              />
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600" />
          </FormItem>
        )}
      />
    </div>
  );
}
