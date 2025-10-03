import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ua'],
  defaultLocale: 'en',
});

export const paths = {
  about: '/about',
  skills: '/skills',
  contact: '/contact',
  cvChecker: '/cv-checker',
};

export const menuPaths = {
  about: 'about',
  skills: 'skills',
  contact: 'contact',
  cvChecker: 'cv-checker',
};
