import { privatePrEnv } from '@/utils/processEnv/private';
import { CookieOptions } from '@supabase/ssr';

export const getServerClientCookiesOptions = (options: Partial<CookieOptions>) => {
  return {
    ...options,
    secure: privatePrEnv.NODE_ENV === 'production',
    // httpOnly: true, // TODO: add
    sameSite: 'lax',
    path: '/',
  } as const;
};
