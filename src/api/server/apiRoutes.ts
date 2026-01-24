import { privatePrEnv } from '@/utils/processEnv/private';

export const ApiRoutes = {
  CV_ANALYSER: {
    baseUrl: privatePrEnv.CV_ANALYSER_BASE_URL,
    analyze: '/resume/analyze' as const,
    status: (jobId: string) => `/resume/${encodeURIComponent(jobId)}/status` as const,
    result: (jobId: string) => `/resume/${encodeURIComponent(jobId)}/result` as const,
    recent: (userId: string) => `/resume/user/${encodeURIComponent(userId)}/recent` as const,
  } as const,

  RECAPTCHA_VERIFY: {
    baseUrl: 'https://www.google.com',
    url: '/recaptcha/api/siteverify',
  } as const,
} as const;

export type ApiRouteKeys = keyof typeof ApiRoutes;
