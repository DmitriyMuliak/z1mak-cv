'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { defaultInputStyles, TextField } from '@/components/Forms/fields/TextField';
import { signUpWithEmailAction } from '@/actions/auth/signUp';
import { SignUpSchemaBase, SignUpSchemaBaseType } from '@/schema/loginSchema';
import { useTranslations } from 'next-intl';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { createOnSubmitHandler } from '@/components/Forms/utils';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { GlobalFormErrorMessage } from '@/components/Forms/fields/GlobalFormErrorMessage';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Link } from '@/navigation';
import { paths } from '@/consts/routes';
import { SubmitActionButton } from '@/components/Forms/buttons/SubmitActionButton';
import { getRedirectFromUrl, redirectedFromURLParamKey } from '@/utils/getRedirectFromUrl';
import { devLogger } from '@/lib/devLogger';
import { TurnstileCaptchaField } from '@/components/Forms/fields/TurnstileCaptcha';
import { useRouter } from '@/i18n/navigation';

const getAdditionalFEData = () => getRedirectFromUrl();

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const t = useTranslations('pages.signUp');
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const [redirectedFromState, setRedirectedFromState] = useState<string | null>(null);
  const form = useForm<SignUpSchemaBaseType>({
    resolver: localizedValibotResolver(SignUpSchemaBase, tv),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', password: '' },
  });
  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });

  useEffect(() => {
    const url = getRedirectFromUrl();
    setRedirectedFromState(url ? `${redirectedFromURLParamKey}=${url}` : '');
  }, []);

  const isSubmitting = form.formState.isSubmitting;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;
  const showSuccessLoader = delayedIsLoading && isSuccess;

  const onSuccessCb = (data: unknown) => {
    devLogger.log('onSuccessCb DATA', data);
    router.push(paths.login + (redirectedFromState ? `?${redirectedFromState}` : ''));
  };
  const handleSubmitCb = createOnSubmitHandler(signUpWithEmailAction, form, onSuccessCb, {
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
                  name="name"
                  label={tf('name.placeholder')}
                  placeholder={tf('name.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <TextField
                  control={form.control}
                  name="email"
                  type="email"
                  label={tf('email.label')}
                  placeholder={tf('email.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <TextField
                  control={form.control}
                  type="password"
                  name="password"
                  label={tf('password.label')}
                  placeholder={tf('password.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <TurnstileCaptchaField
                  control={form.control}
                  name="captchaToken"
                  formName="sign-up"
                  containerClassName="sm:-ml-[6px]"
                />
                <Field>
                  <SubmitActionButton
                    isSubmitting={isSubmitting}
                    isFormInvalid={isFormInvalid}
                    showSuccessLoader={showSuccessLoader}
                    title={t('signUpTitle')}
                    onSuccessTitle={tc('formButtonSendSuccessTitle')}
                  />
                  <GlobalFormErrorMessage />
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t('termsAndPrivacyTitle')}{' '}
        <Link href={paths.termsOfService}>{t('termsOfServiceTitle')}</Link>{' '}
        {t('termsAndPrivacySeparatorTitle')}{' '}
        <Link href={paths.privacyPolicy}>{t('privacyPolicyTitle')}</Link>.
      </FieldDescription>
    </div>
  );
}
