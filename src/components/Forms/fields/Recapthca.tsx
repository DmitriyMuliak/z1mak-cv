'use client';

import { RecaptchaV2 } from '@/components/Recaptcha';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { Control, FieldValues, Path, UseFormClearErrors } from 'react-hook-form';

interface ReCaptchaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  visible: boolean;
  clearErrors: UseFormClearErrors<T>;
}

export function RecaptchaField<T extends FieldValues>({
  control,
  name,
  visible,
  clearErrors,
}: ReCaptchaProps<T>) {
  useEffect(() => {
    if (!visible) {
      clearErrors(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div
      className="relative"
      data-form-field-id={name}
      style={{
        display: visible ? 'block' : 'none',
      }}
    >
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RecaptchaV2
                visible={visible}
                onVerify={(token) => {
                  field.onChange(token);
                }}
              />
            </FormControl>
            <FormMessage className="text-red-700 dark:text-red-600" />
          </FormItem>
        )}
      />
    </div>
  );
}
