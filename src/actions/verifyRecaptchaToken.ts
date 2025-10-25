'use server';

import { privatePrEnv } from '@/utils/processEnv/private';
import { ApiRoutes } from '@/api/server/apiRoutes';
import { apiGoogleCaptcha } from '@/api/server';
import { requestContentTypes } from '@/consts/requestContentTypes';

type RecaptchaPostData = {
  secret: string;
  response: string;
};

export const recaptchaErrorCodes = {
  'missing-input-secret': 'The secret parameter is missing.',
  'invalid-input-secret': 'The secret parameter is invalid or malformed.',
  'missing-input-response': 'The response parameter is missing.',
  'invalid-input-response': 'The response parameter is invalid or malformed.',
  'bad-request': 'The request is invalid or malformed.',
  'timeout-or-duplicate':
    'The response is no longer valid: either is too old or has been used previously.',
};

type RecaptchaErrorCodes = keyof typeof recaptchaErrorCodes;

export type RecaptchaVerifyResponse = {
  success: boolean;
  'error-codes'?: RecaptchaErrorCodes[];
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
