'use server';

import { createServerClient } from '@/lib/supabase/server';
import { SetPasswordSchemaBase } from '@/schema/authSchema';
import { getLocale } from 'next-intl/server';
import { createFormAction } from '../utils';
import { redirect } from '@/i18n/navigation';
import { paths } from '@/consts/routes';
import { devLogger } from '@/lib/devLogger';

export const setPasswordAction = createFormAction(SetPasswordSchemaBase, async (values) => {
  const supabase = await createServerClient();
  const locale = await getLocale();
  const { error } = await supabase.auth.updateUser({
    password: values.password,
  });
  if (error) {
    devLogger.log('error updateUser password', error);
    if (error.code === 'captcha_failed') {
      return {
        metaError: 'captchaInvalid',
      };
    }
    return { metaError: 'unknown' };
  } else {
    redirect({
      href: { pathname: paths.home },
      locale,
    });
  }
});
