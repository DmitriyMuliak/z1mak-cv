import { createBrowserClient } from '@supabase/ssr';
import { publicPrEnv } from '@/utils/processEnv/public';

const SUPABASE_URL = publicPrEnv.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = publicPrEnv.NEXT_PUBLIC_SUPABASE_PUBLISHEBLE_KEY;

export const supabaseBrowser = createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
