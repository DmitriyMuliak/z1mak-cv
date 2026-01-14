'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { setPasswordAction } from '@/actions/auth/setPassword';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import { defaultInputStyles, TextField } from '@/components/Forms/fields/TextField';
import { SetPasswordSchemaBase, SetPasswordSchemaBaseType } from '@/schema/authSchema';
import { createOnSubmitHandler } from '@/components/Forms/utils';
import { GlobalFormErrorMessage } from '@/components/Forms/fields/GlobalFormErrorMessage';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { SubmitActionButton } from '@/components/Forms/buttons/SubmitActionButton';

export function SetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const t = useTranslations('pages.setPassword');
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const form = useForm<SetPasswordSchemaBaseType>({
    resolver: localizedValibotResolver(SetPasswordSchemaBase, tv),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });
  const isSubmitting = form.formState.isSubmitting;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;
  const showSuccessLoader = delayedIsLoading && isSuccess;

  const handleSubmitCb = createOnSubmitHandler(setPasswordAction, form);
  const onSubmit = form.handleSubmit(handleSubmitCb);
  const isFormInvalid = Object.keys(form.formState.errors).length > 0;

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <Card className="bg-transparent shadow-none border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="flex-1 max-w-md space-y-5">
              <FieldGroup>
                <TextField
                  control={form.control}
                  name="password"
                  type="password"
                  label={tf('password.label')}
                  placeholder={tf('password.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <TextField
                  control={form.control}
                  name="confirmPassword"
                  type="password"
                  label={tf('confirmPassword.label')}
                  placeholder={tf('confirmPassword.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <Field>
                  <SubmitActionButton
                    isSubmitting={isSubmitting}
                    isFormInvalid={isFormInvalid}
                    showSuccessLoader={showSuccessLoader}
                    title={tc('formButtonSendTitle')}
                    onSuccessTitle={tc('formButtonSendSuccessTitle')}
                  />
                  <GlobalFormErrorMessage />
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
