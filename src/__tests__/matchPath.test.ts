import { describe, expect, it } from 'vitest';
import { isPublic } from '@/utils/matchPath';

describe('isPublic', () => {
  const publicPatterns = ['/', '/about', '/about/*', '/about/$id/*', '/contact', '/login'];

  it('matches public routes with locales and wildcards', () => {
    expect(isPublic('/login', publicPatterns)).toBe(true);
    expect(isPublic('/en/login/', publicPatterns)).toBe(true);
    expect(isPublic('/en/about', publicPatterns)).toBe(true);
    expect(isPublic('/en-US/about/', publicPatterns)).toBe(true);
    expect(isPublic('/en/about/42/edit/x', publicPatterns)).toBe(true);
    expect(isPublic('/ua/about/page/123', publicPatterns)).toBe(true);
    expect(isPublic('/about/abc/edit', publicPatterns)).toBe(true);
  });
});
