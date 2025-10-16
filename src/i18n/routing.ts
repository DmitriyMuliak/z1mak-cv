import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'uk'],
  defaultLocale: 'en',
});

export const paths = {
  about: '/about',
  skills: '/skills',
  contact: '/contact',
  cvChecker: '/cv-checker',
  login: '/login',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
};

export const pathsWithCustomBackground = {
  about: 'about',
  skills: 'skills',
  contact: 'contact',
  cvChecker: 'cv-checker',
};
