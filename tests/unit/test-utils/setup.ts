import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React, { ComponentPropsWithoutRef } from 'react';

// Translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Navigation
vi.mock('@/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  Link: ({ children, href, className, ...props }: ComponentPropsWithoutRef<'a'>) =>
    React.createElement(
      'a',
      {
        href,
        className,
        onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
          e.preventDefault();
          props.onClick?.(e);
        },
        ...props,
      },
      children,
    ),
}));

// Radix Select uses scrollIntoView; jsdom doesn't implement it by default
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Examples:

/**
 * Example of use __mock__ folder by Vite
 *
 * vi.mock('@/api/apiService/readLimitedBody');
 *
 */

/**
 * Example of change global mocked value in some test:
 *
 * const usePathnameMock = vi.mocked(navigation.usePathname);
 * usePathnameMock.mockReturnValue('/about');
 *
 */
