import 'server-only';

import { ApiService } from '@/api/apiService';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { redirect } from '@/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { paths } from '@/consts/routes';
import { getLocale } from 'next-intl/server';

export const apiGoogleCaptcha = new ApiService({
  baseUrl: ApiRoutes.RECAPTCHA_VERIFY.baseUrl,
});

export const apiCvAnalyser = new ApiService({
  baseUrl: ApiRoutes.CV_ANALYSER.baseUrl,
});

apiCvAnalyser.interceptors.request.use(async (config) => {
  const supabase = await createServerClient();
  const locale = await getLocale();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    redirect({ href: { pathname: paths.login }, locale });
    return Promise.reject(new Error('Unauthorized'));
  }

  const token = session.access_token;

  const headers = new Headers(config.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('x-internal-api-key', process.env.INTERNAL_API_KEY ?? 'internal api key is not set');

  return config;
});
