import { privatePrEnv } from '@/utils/processEnv/private';

export const ApiRoutes = {
  CV_ANALYSER: {
    baseUrl: privatePrEnv.CV_ANALYSER_BASE_URL,
    analyze: '/resume/analyze',
    status: (jobId: string) => `/resume/${encodeURIComponent(jobId)}/status`,
    result: (jobId: string) => `/resume/${encodeURIComponent(jobId)}/result`,
    recent: (userId: string) => `/resume/user/${encodeURIComponent(userId)}/recent`,
  },

  RECAPTCHA_VERIFY: {
    baseUrl: 'https://www.google.com',
    url: '/recaptcha/api/siteverify',
  },
} as const;

export type ApiRouteKeys = keyof typeof ApiRoutes;
