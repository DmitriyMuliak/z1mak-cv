import * as v from 'valibot';

const EnvSchema = v.object({
  RECAPTCHA_SECRET_KEY: v.pipe(v.string(), v.minLength(1)),
  NODE_ENV: v.union([v.literal('development'), v.literal('testing'), v.literal('production')]),
});

const parsedEnv = v.safeParse(EnvSchema, process.env);

if (!parsedEnv.success) {
  // Can be used for debugging proposes
  // console.error(
  //   '❌ Have wrong environment variables:',
  //   {issues: parsedEnv.issues, env: process.env},
  // );

  throw new Error('Configuration Error: Invalid Private environment variables');
}

export const privatePrEnv = parsedEnv.output;
export type PrivateEnvSchemaType = v.InferOutput<typeof EnvSchema>;
