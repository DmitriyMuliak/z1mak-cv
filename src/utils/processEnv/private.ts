import * as v from 'valibot';

const EnvSchema = v.object({
  NODE_ENV: v.union([v.literal('development'), v.literal('testing'), v.literal('production')]),
  SUPABASE_SERVICE_ROLE_KEY: v.pipe(v.string(), v.minLength(1)),
  RECAPTCHA_SECRET_KEY: v.pipe(v.string(), v.minLength(1)),
  CLOUDFLARE_CAPTCHA_SECRET_KEY: v.pipe(v.string(), v.minLength(1)),
  GMAIL_PASS: v.pipe(v.string(), v.minLength(1)),
  GMAIL_USER: v.pipe(v.string(), v.minLength(1)),
  AWS_ACCESS_KEY_ID: v.pipe(v.string(), v.minLength(1)),
  AWS_SECRET_ACCESS_KEY: v.pipe(v.string(), v.minLength(1)),
  GEMINI_API_KEY: v.pipe(v.string(), v.minLength(1)),
  CV_ANALYSER_BASE_URL: v.pipe(v.string(), v.url()),
  // Not secret key but not public --- start
  AWS_REGION: v.pipe(v.string(), v.minLength(1)),
  AWS_S3_BUCKET: v.pipe(v.string(), v.minLength(1)),
  // Not secret key but not public --- end
});

const parsedEnv = v.safeParse(EnvSchema, process.env);

if (!parsedEnv.success) {
  const messages = parsedEnv.issues.map((i) => i.message);
  console.error('❌ Have wrong environment variables:', {
    messages,
    // Can be used for debugging proposes
    // issues: parsedEnv.issues,
    // env: process.env,
  });

  throw new Error('Configuration Error: Invalid Private environment variables');
}

export const privatePrEnv = parsedEnv.output;
export type PrivateEnvSchemaType = v.InferOutput<typeof EnvSchema>;
