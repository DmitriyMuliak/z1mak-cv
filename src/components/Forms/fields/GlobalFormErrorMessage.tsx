'use client';

import { FormField, FormMessage } from '@/components/ui/form';
import type { Control, FieldValues } from 'react-hook-form';

interface GlobalFormErrorMessageProps<T extends FieldValues> {
  control?: Control<T>;
}

export function GlobalFormErrorMessage<T extends FieldValues>(
  _props: GlobalFormErrorMessageProps<T>,
) {
  return (
    <div className="relative" data-form-error-field-id={'root.unexpected'}>
      <FormField
        name={'root.unexpected'}
        render={() => <FormMessage className="text-red-700 dark:text-red-600" />}
      />
    </div>
  );
}
