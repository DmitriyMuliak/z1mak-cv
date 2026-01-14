'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { defaultInputStyles, TextField } from '@/components/Forms/fields/TextField';
import { requestResetPasswordAction } from '@/actions/auth/requestResetPassword';
import {
  RequestResetPasswordSchemaBase,
  RequestResetPasswordSchemaBaseType,
} from '@/schema/authSchema';
import { useTranslations } from 'next-intl';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { createOnSubmitHandler, resetCaptchaOnError } from '@/components/Forms/utils';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { GlobalFormErrorMessage } from '@/components/Forms/fields/GlobalFormErrorMessage';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { SubmitActionButton } from '@/components/Forms/buttons/SubmitActionButton';
import { getStateWithRedirectFromUrl } from '@/utils/getRedirectFromUrl';
import { useRouter } from '@/i18n/navigation';
import { TurnstileCaptchaField } from '@/components/Forms/fields/TurnstileCaptcha';
import { paths } from '@/consts/routes';
import type { TurnstileCaptchaRef } from '@/components/TurnstileCaptcha';

const getAdditionalFEData = () => getStateWithRedirectFromUrl();

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const t = useTranslations('pages.requestResetPassword');
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const form = useForm<RequestResetPasswordSchemaBaseType>({
    resolver: localizedValibotResolver(RequestResetPasswordSchemaBase, tv),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });
  const captchaRef = React.useRef<TurnstileCaptchaRef>(null);
  const router = useRouter();

  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });
  const isSubmitting = form.formState.isSubmitting;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;
  const showSuccessLoader = delayedIsLoading && isSuccess;

  const onResult = (result: Awaited<ReturnType<typeof requestResetPasswordAction>>) => {
    resetCaptchaOnError(result, captchaRef);
    result.success && router.replace(paths.home);
  };

  const handleSubmitCb = createOnSubmitHandler(requestResetPasswordAction, form, onResult, {
    getAdditionalFEData,
  });
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
                  name="email"
                  type="email"
                  label={tf('email.label')}
                  placeholder={tf('email.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <TurnstileCaptchaField
                  control={form.control}
                  name="captchaToken"
                  formName="reset-pass-request"
                  containerClassName="sm:-ml-[6px]"
                  ref={captchaRef}
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
