import { locales } from '@/consts/locales';

export function stripLocale(path: string): string {
  const parts = path.split('/').filter(Boolean);

  if (parts.length && locales.includes(parts[0])) {
    const rest = parts.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
}
