import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PropsWithChildren } from 'react';

type MediaQueryProps = {
  screen: (typeof screenType)[keyof typeof screenType];
  mode?: 'hide' | 'show';
};

export const MediaQuery = ({
  children,
  screen,
  mode = 'show',
}: PropsWithChildren<MediaQueryProps>) => {
  const isMatch = useMediaQuery(screen);

  const shouldShow = mode === 'show' ? isMatch : !isMatch;

  return shouldShow ? <>{children}</> : null;
};

export const screenType = {
  md: '(min-width: 768px)',
} as const;
