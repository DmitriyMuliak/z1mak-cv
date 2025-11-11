'use server';

import { redirect } from '@/i18n/navigation';
import { devLogger } from '@/lib/devLogger';
import { createServerClient } from '@/lib/supabase/server';
import { getLocale } from 'next-intl/server';

export const signOutAction = async () => {
  const locale = await getLocale();
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    devLogger.log('signOutAction Error', error);
    return { success: false };
  } else {
    redirect({ href: '/', locale });
  }
};
