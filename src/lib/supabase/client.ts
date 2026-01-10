import { createBrowserClient } from '@supabase/ssr';
import { publicPrEnv } from '@/utils/processEnv/public';
import type { Database } from '@/types/database/database-gen';

const SUPABASE_URL = publicPrEnv.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = publicPrEnv.NEXT_PUBLIC_SUPABASE_PUBLISHEBLE_KEY;

export const supabaseBrowser = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
  isSingleton: true,
});
