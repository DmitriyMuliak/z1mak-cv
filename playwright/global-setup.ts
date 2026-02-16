import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey || !email || !password) {
    throw new Error(
      'Missing environment variables for E2E global setup. Please ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_USER_EMAIL, and TEST_USER_PASSWORD are set.',
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const session = data.session;
  if (!session) throw new Error('No session returned from Supabase');

  const projectId = supabaseUrl.split('.')[0].split('//')[1];

  const cookieVal = `base64-${Buffer.from(JSON.stringify(session)).toString('base64')}`;

  const authState = {
    cookies: [
      {
        name: `sb-${projectId}-auth-token`,
        value: cookieVal,
        domain: 'localhost',
        path: '/',
        expires: session.expires_at,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [],
  };

  const authFile = path.join(process.cwd(), 'auth.json');
  fs.writeFileSync(authFile, JSON.stringify(authState, null, 2));

  console.log('✅ Fresh auth session generated for E2E tests');
}
