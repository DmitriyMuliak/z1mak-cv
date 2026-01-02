export function stripLocale(path: string): string {
  const clear = path.split('/').filter(Boolean).slice(1).join('/');
  return clear ? `/${clear}` : '/';
}
