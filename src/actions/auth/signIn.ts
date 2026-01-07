'use server';

import { SignInSchemaBase } from '@/schema/loginSchema';
import { createServerClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/utils/getBaseUrl';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createFormAction } from '../utils';
import { devLogger } from '@/lib/devLogger';

export async function signInOrUpWithGoogleAction(state: string | null = '') {
  const supabase = await createServerClient();
  const url = getBaseUrl() + '/api/auth/callback';
  const redirectTo = state ? url + `?state=${state}` : url;

  // if user not exist - will create him
  // by default linkIdentity is off
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo, // redirect to callback from email
      queryParams: {
        scope: 'openid email profile',
        // access_type: 'offline', // if need refresh_token from google
      },
    },
  });

  if (error) {
    devLogger.log('Google signInWithOAuth Error: ', error);
  }

  if (data.url) {
    redirect(data.url); // redirect to google auth page
  }
}

export const signInWithEmailAction = createFormAction(
  SignInSchemaBase,
  async (dataForm, _formData, state) => {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dataForm.email,
      password: dataForm.password,
      options: { captchaToken: dataForm.captchaToken },
    });

    if (error) {
      const locale = await getLocale();
      const t = await getTranslations({ namespace: 'validator', locale });
      if (error.code === 'invalid_credentials') {
        return { success: false, errors: { email: [''], password: [t('invalid_credentials')] } };
      }
      if (error.code === 'captcha_failed') {
        return { success: false, errors: { captchaToken: [t('captchaInvalid')] } };
      }
      return { success: false };
    }

    return {
      success: true,
      data: { userMetadata: data.user?.user_metadata, redirectTo: state as string },
    };
  },
);

// Example of function lvl server action
// export async function signInWithEmailAction2(formData: FormData) {
//   'use server';
//   return createFormAction(
//     SignInSchemaBase,
//     async (data): SignInActionReturn => {
//       devLogger.log('data', data)
//     }
//   )(formData);
// };
