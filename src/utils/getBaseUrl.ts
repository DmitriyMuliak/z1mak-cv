import { publicPrEnv } from './processEnv/public';

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    return publicPrEnv.NEXT_PUBLIC_SITE_URL;
  }

  // Preview (PR) or Development on Vercel
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Local development
  return publicPrEnv.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000`;
}
