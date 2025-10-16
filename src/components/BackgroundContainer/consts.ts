export type PathsWithBackground = keyof typeof pathsWithCustomBackground | typeof defaultPath;

export const defaultPath = 'defaultPath' as const;
const pathsWithCustomBackground = {
  about: 'about',
  skills: 'skills',
  contact: 'contact',
  cvChecker: 'cv-checker',
};

export const paths = [
  ...Object.values(pathsWithCustomBackground),
  defaultPath,
] as Array<PathsWithBackground>;
