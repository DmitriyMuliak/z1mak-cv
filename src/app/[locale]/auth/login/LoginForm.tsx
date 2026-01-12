'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { defaultInputStyles, TextField } from '@/components/Forms/fields/TextField';
import { signInWithEmailAction, signInOrUpWithGoogleAction } from '@/actions/auth/signIn';
import { SignInSchemaBase, SignInSchemaBaseType } from '@/schema/loginSchema';
import { useTranslations } from 'next-intl';
import { localizedValibotResolver } from '@/lib/validator/localizedSchemaResolver';
import { createOnSubmitHandler, resetCaptchaOnError } from '@/components/Forms/utils';
import { useDelayedSubmitting } from '@/hooks/useDelayedSubmitting';
import { GlobalFormErrorMessage } from '@/components/Forms/fields/GlobalFormErrorMessage';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { paths } from '@/consts/routes';
import { SubmitActionButton } from '@/components/Forms/buttons/SubmitActionButton';
import GoogleIcon from '@/components/icons/GoogleIcon';
import {
  getRedirectFromUrl,
  getStateWithRedirectFromUrl,
  redirectedFromURLParamKey,
} from '@/utils/getRedirectFromUrl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Link } from '@/navigation';
import { stripLocale } from '@/utils/stripLocale';
import { TurnstileCaptchaField } from '@/components/Forms/fields/TurnstileCaptcha';
import type { TurnstileCaptchaRef } from '@/components/TurnstileCaptcha';
import type { ValidationKeys } from '@/types/translations';
import { useSearchParams } from 'next/navigation';

const getAdditionalFEData = () => getStateWithRedirectFromUrl();
const toastCaptchaId = 'toast-login-form-captcha';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const t = useTranslations('pages.login');
  const tf = useTranslations('fields');
  const tc = useTranslations('common');
  const tv = useTranslations('validator');
  const captchaRef = React.useRef<TurnstileCaptchaRef>(null);
  const form = useForm<SignInSchemaBaseType>({
    resolver: localizedValibotResolver(SignInSchemaBase, tv),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });
  const { delayedIsLoading } = useDelayedSubmitting({ isSubmitting: form.formState.isSubmitting });
  const [redirectedFromState, setRedirectedFromState] = useState<string | null>(null);
  useEffect(() => {
    const url = getRedirectFromUrl();
    setRedirectedFromState(url ? `${redirectedFromURLParamKey}=${url}` : '');
  }, []);

  const isSubmitting = form.formState.isSubmitting;
  const isSuccess = !isSubmitting && form.formState.isSubmitSuccessful;
  const showSuccessLoader = delayedIsLoading && isSuccess;

  const searchParams = useSearchParams(); // ✅
  const pathname = usePathname(); // ✅

  // ✅ helpers
  const debug = (...args: unknown[]) => console.log('[LoginRedirectDebug]', ...args);

  useEffect(() => {
    debug('env', {
      href: typeof window !== 'undefined' ? window.location.href : 'ssr',
      pathname,
      search: typeof window !== 'undefined' ? window.location.search : 'ssr',
    });

    // що реально в query?
    debug('query.redirectedFrom', searchParams.get('redirectedFrom'));

    // що повертає твоя утиліта
    const url = getRedirectFromUrl();
    debug('getRedirectFromUrl()', url);

    setRedirectedFromState(url ? `${redirectedFromURLParamKey}=${url}` : '');
  }, [pathname, searchParams]);

  const onResult = (result: Awaited<ReturnType<typeof signInWithEmailAction>>) => {
    debug('action.result', result);

    resetCaptchaOnError(result, captchaRef);

    if (!result.success) {
      debug('action.failed', { metaError: result.metaError, errors: result.errors });
      if (result.metaError) {
        toast.error(tv(result.metaError as ValidationKeys), { id: toastCaptchaId, duration: 2000 });
      }
      return;
    }

    if (!result.data?.redirectTo) {
      debug('action.success BUT no redirectTo in data', result.data);
      return;
    }

    const raw = result.data.redirectTo;
    const decoded = (() => {
      try {
        return decodeURIComponent(raw);
      } catch (e) {
        debug('decodeURIComponent failed', { raw, e });
        return raw;
      }
    })();

    debug('redirectTo.raw/decoded', { raw, decoded });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any = null;
    try {
      parsed = JSON.parse(decoded);
    } catch (e) {
      debug('JSON.parse failed', { decoded, e });
      return;
    }

    debug('redirectTo.parsed', parsed);

    const redirectedFrom = parsed?.redirectedFrom;
    if (!redirectedFrom || typeof redirectedFrom !== 'string') {
      debug('parsed.redirectedFrom missing/invalid', { redirectedFrom });
      return;
    }

    const target = stripLocale(redirectedFrom);
    debug('router.replace target', target);

    router.replace(target); //
  };
  const handleSubmitCb = createOnSubmitHandler(signInWithEmailAction, form, onResult, {
    getAdditionalFEData,
  });

  const onSubmit = form.handleSubmit(handleSubmitCb);
  const isFormInvalid = Object.keys(form.formState.errors).length > 0; // form.formState.isValid;

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="bg-transparent shadow-none border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>{t('oAuthTitle')}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="flex-1 max-w-md space-y-5">
              <FieldGroup>
                <Field>
                  <Button
                    onClick={() => signInOrUpWithGoogleAction(getAdditionalFEData())}
                    variant="outline"
                    type="button"
                  >
                    <GoogleIcon />
                    {t('googleBtnTitle')}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card *:data-[slot=field-separator-content]:rounded-xl">
                  {t('otherAuthWayTitle')}
                </FieldSeparator>
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
                  label={
                    <div className="flex items-center w-full">
                      <FieldLabel htmlFor="password">{tf('password.label')}</FieldLabel>
                      <Link
                        href={paths.resetPassword}
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        {t('forgotPasswordTitle')}
                      </Link>
                    </div>
                  }
                  placeholder={tf('password.placeholder')}
                  inputClassName={defaultInputStyles}
                />
                <TurnstileCaptchaField
                  control={form.control}
                  name="captchaToken"
                  formName="sign-in"
                  containerClassName="sm:-ml-[6px]"
                  ref={captchaRef}
                />
                <Field>
                  <SubmitActionButton
                    isSubmitting={isSubmitting}
                    isFormInvalid={isFormInvalid}
                    showSuccessLoader={showSuccessLoader}
                    title={t('loginTitle')}
                    onSuccessTitle={tc('formButtonSendSuccessTitle')}
                  />
                  <GlobalFormErrorMessage />
                  <FieldDescription className="text-center">
                    {t('dontHaveAccountTitle')}{' '}
                    <Link href={`${paths.signUp}?${redirectedFromState}`}>{t('signUpTitle')}</Link>
                  </FieldDescription>
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
