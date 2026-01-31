import * as v from 'valibot';

// Custom variables without the NEXT_PUBLIC_ prefix are not exposed to the client-side bundle. They are only available on the server.
export const EnvSchema = v.object({
  NODE_ENV: v.union([v.literal('development'), v.literal('test'), v.literal('production')]),
  NEXT_PUBLIC_SUPABASE_URL: v.pipe(v.string(), v.minLength(1)),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: v.pipe(v.string(), v.minLength(1)),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: v.pipe(v.string(), v.minLength(1)),
  NEXT_PUBLIC_CLOUDFLARE_CAPTCHA_SITE_KEY: v.pipe(v.string(), v.minLength(1)),
  NEXT_PUBLIC_DEV_LOGGER: v.optional(v.union([v.literal('true'), v.literal('false')])),
  NEXT_PUBLIC_SITE_URL: v.pipe(v.string(), v.url()),
});

const parsedEnv = v.safeParse(EnvSchema, {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  NEXT_PUBLIC_CLOUDFLARE_CAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CLOUDFLARE_CAPTCHA_SITE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_DEV_LOGGER: process.env.NEXT_PUBLIC_DEV_LOGGER,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedEnv.success) {
  parsedEnv.issues.forEach((i) => console.error('❌ Have wrong environment variable:', i.path)); // i.path can be used for debug

  throw new Error('Configuration Error: Invalid Public environment variables');
}

export const publicPrEnv = parsedEnv.output;
export type PublicEnvSchemaType = v.InferOutput<typeof EnvSchema>;
