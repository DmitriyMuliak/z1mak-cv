export const ApiRoutes = {
  // USERS: '/users',
  // USER_BY_ID: (id: string | number) => `/users/${id}`,

  // AUTH_LOGIN: '/auth/login',
  // AUTH_LOGOUT: '/auth/logout',

  RECAPTCHA_VERIFY: {
    url: '/recaptcha/api/siteverify',
    baseUrl: 'https://www.google.com',
  },
} as const;

export type ApiRouteKeys = keyof typeof ApiRoutes;
