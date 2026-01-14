import { privatePrEnv } from '@/utils/processEnv/private';
import { CookieOptions } from '@supabase/ssr';

export const getServerClientCookiesOptions = (options: Partial<CookieOptions>) => {
  return {
    ...options,
    secure: privatePrEnv.NODE_ENV === 'production',
    // httpOnly: true, // TODO: check new @supabase/ssr for this new flag
    sameSite: 'lax',
    path: '/',
  } as const;
};
