import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  const finalResponse = await updateSession(request, response);
  // https://nextjs.org/docs/app/guides/content-security-policy
  // finalResponse.headers.set('Content-Security-Policy', csp);
  return finalResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',

  // How can I match pathnames that contain dots like `/users/jane.doe`?
  // Match all pathnames within `{/:locale}/users`
  // '/([\\w-]+)?/users/(.+)'
};

// Migrate to v16 - npx @next/codemod@canary middleware-to-proxy .
// export default createMiddleware(routing);
export default middleware;
