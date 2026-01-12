import { createServerClient as createServerClientSupabase } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicPrEnv } from '@/utils/processEnv/public';
import { getServerClientCookiesOptions } from './utils/getServerClientCookiesOptions';
import type { Database } from '@/types/database/database-gen';

const NEXT_PUBLIC_SUPABASE_URL = publicPrEnv.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = publicPrEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function createServerClient() {
  const cookieStore = await cookies();

  return createServerClientSupabase<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const fixedOptions = getServerClientCookiesOptions(options);
              cookieStore.set(name, value, fixedOptions);
            });
          } catch (e: unknown) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error(
              'The `setAll` method from createServerClientSupabase was called from a Server Component.',
              e,
            );
          }
        },
      },
    },
  );
}
