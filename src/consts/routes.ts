export const paths = {
  root: '/',
  home: '/about',
  skills: '/skills',
  contact: '/contact',
  cvChecker: '/cv-checker',
  cvReport: '/cv-checker/report',
  login: '/auth/login',
  signUp: '/auth/sign-up',
  resetPassword: '/auth/reset-password',
  setPassword: '/auth/set-password',
  changeEmail: '/auth/change-email',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
} as const;

export type PathKeys = keyof typeof paths;
export type PathValues = (typeof paths)[keyof typeof paths];
