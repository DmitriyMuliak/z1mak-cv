import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React, { ComponentPropsWithoutRef } from 'react';

// Ensure modules that validate env on import have stable defaults in unit tests.
const TEST_PUBLIC_ENV_DEFAULTS: Record<string, string> = {
  NEXT_PUBLIC_API_URL: 'https://stub.com',
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-anon-key',
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: 'test-recaptcha-key',
  NEXT_PUBLIC_CLOUDFLARE_CAPTCHA_SITE_KEY: 'test-turnstile-key',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

for (const [key, value] of Object.entries(TEST_PUBLIC_ENV_DEFAULTS)) {
  process.env[key] ??= value;
}

process.env.NEXT_PUBLIC_DEV_LOGGER ??= 'false';

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
