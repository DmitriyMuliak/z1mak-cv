import { paths } from '@/consts/routes';
import { isPublic } from '@/utils/matchPath';
import { privatePrEnv } from '@/utils/processEnv/private';
import { publicPrEnv } from '@/utils/processEnv/public';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerClientCookiesOptions } from './utils/getServerClientCookiesOptions';

const publicInfoPatterns = [paths.termsOfService, paths.privacyPolicy];
const publicAuthPatterns = [paths.login, paths.signUp, paths.resetPassword, paths.setPassword];
const publicPatterns = [
  paths.root,
  paths.home,
  paths.contact,
  paths.skills,
  ...publicInfoPatterns,
  ...publicAuthPatterns,
];

export async function updateSession(
  request: NextRequest,
  response: NextResponse, // come from next-intl/middleware
) {
  const supabase = createServerClient(
    publicPrEnv.NEXT_PUBLIC_SUPABASE_URL,
    privatePrEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Updating cookies in the request
            // request.cookies ignores all options (secure, sameSite, path, etc.)
            // because they only make sense when we send the response back to the browser.
            request.cookies.set(name, value);

            // Updating cookies in the response so the browser receives them
            const fixedOptions = getServerClientCookiesOptions(options);
            response.cookies.set(name, value, fixedOptions);
          });
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Don't remove getClaims()
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && !isPublic(request.nextUrl.pathname, publicPatterns)) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = paths.login;
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return response;
}
