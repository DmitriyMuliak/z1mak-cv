'use server';

import { createServerClient } from '@/lib/supabase/server';

export const getUserInfo = async () => {
  const supabase = await createServerClient();
  const [claims, session, user] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);
  return JSON.stringify(
    {
      claims,
      session,
      user,
    },
    null,
    2,
  );
};
