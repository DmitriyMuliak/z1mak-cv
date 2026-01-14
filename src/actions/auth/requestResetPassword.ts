'use server';

import { createServerClient } from '@/lib/supabase/server';
import { RequestResetPasswordSchemaBase } from '@/schema/authSchema';
import { getLocale } from 'next-intl/server';
import { createFormAction } from '../utils';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { paths } from '@/consts/routes';

export const requestResetPasswordAction = createFormAction(
  RequestResetPasswordSchemaBase,
  async (values) => {
    const supabase = await createServerClient();
    const locale = await getLocale();
    const url = getBaseUrl() + '/' + locale + paths.setPassword;
    await supabase.auth.resetPasswordForEmail(values.email, {
      captchaToken: values.captchaToken,
      redirectTo: url,
    });
  },
);
