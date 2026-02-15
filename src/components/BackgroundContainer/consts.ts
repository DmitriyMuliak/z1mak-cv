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

type PathConfig = {
  light: {
    color1: string;
    color2: string;
    color3: string;
    outerColor: string;
  };
  dark: {
    color1: string;
    color2: string;
    color3: string;
    outerColor: string;
  };
};

type PathsConfig = {
  [key: string]: PathConfig;
};

export const pathsConfig: PathsConfig = {
  [pathsWithCustomBackground['/about']]: {
    light: {
      color1: '#2a7b9b',
      color2: '#57c785',
      color3: '#eddd53',
      outerColor: '#eddd53',
    },
    dark: {
      color1: '#162e3d',
      color2: '#333b66',
      color3: '#1a1b26',
      outerColor: '#1a1b26',
    },
  },
  [pathsWithCustomBackground['/skills']]: {
    light: {
      color1: '#3db47a',
      color2: '#eddd53',
      color3: '#feb47b',
      outerColor: '#feb47b',
    },
    dark: {
      color1: '#333b66',
      color2: '#63608b',
      color3: '#001c2f',
      outerColor: '#001c2f',
    },
  },
  [pathsWithCustomBackground['/contact']]: {
    light: {
      color1: '#ff7e5f',
      color2: '#feb47b',
      color3: '#86a8e7',
      outerColor: '#86a8e7',
    },
    dark: {
      color1: '#333b66',
      color2: '#326a9d',
      color3: '#0a0c14',
      outerColor: '#0a0c14',
    },
  },
  defaultPath: {
    light: {
      color1: '#93a5cf',
      color2: '#e4efe9',
      color3: '#e4efe9',
      outerColor: '#e4efe9',
    },
    dark: {
      color1: '#29323c',
      color2: '#485563',
      color3: '#485563',
      outerColor: '#485563',
    },
  },
};

export const animationDurationMs = 800;

export const styleStopTag = {
  transition: `stop-color ${animationDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
};

export const styleRectTag = {
  transition: `opacity ${animationDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
};

export const wrapperStyle = {
  isolation: 'isolate' as const,
};

export const svgTagStyle = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
};
