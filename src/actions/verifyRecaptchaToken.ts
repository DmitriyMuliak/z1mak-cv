'use server';

import { privatePrEnv } from '@/utils/processEnv/private';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { apiGoogleCaptcha } from '@/api/server';
import { requestContentTypes } from '@/consts/requestContentTypes';

type RecaptchaPostData = {
  secret: string;
  response: string;
};

export type RecaptchaVerifyResponse = {
  success: boolean;
  'error-codes'?: string[];
  action: string;
  challenge_ts: string;
  hostname: string;
  score?: number; // only for captcha v3
};

export async function verifyRecaptchaToken(token: string): Promise<RecaptchaVerifyResponse> {
  const data = await apiGoogleCaptcha.post<RecaptchaVerifyResponse, URLSearchParams>(
    ApiRoutes.RECAPTCHA_VERIFY.url,
    new URLSearchParams({
      secret: privatePrEnv.RECAPTCHA_SECRET_KEY,
      response: token,
    } satisfies RecaptchaPostData),
    {
      headers: { 'Content-Type': requestContentTypes.formUrlEncoded },
    },
  );

  return {
    success: data.success,
    action: data.action,
    challenge_ts: data.challenge_ts,
    hostname: data.hostname,
    ...(data.score ? { score: data.score } : {}), // only for captcha v3
  };
}
