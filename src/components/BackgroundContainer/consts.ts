import { paths } from '@/consts/routes';

export const defaultPath = 'defaultPath' as const;
export const pathsWithCustomBackground = {
  [paths.home]: paths.home,
  [paths.skills]: paths.skills,
  [paths.contact]: paths.contact,
  [paths.cvChecker]: paths.cvChecker,
} as const;

export const pathsList = [
  ...Object.values(pathsWithCustomBackground),
  defaultPath,
] as Array<PathsWithBackground>;

export type PathsWithDefaultBackground =
  | keyof typeof pathsWithCustomBackground
  | typeof defaultPath;
export type PathsWithBackground = keyof typeof pathsWithCustomBackground;
