'use client';

import { useSyncExternalStore } from 'react';
import { pathsWithCustomBackground } from '@/i18n/routing';

let currentPathName = '';
const defaultPath = 'defaultPath' as const;
type PathsWithBackground = keyof typeof pathsWithCustomBackground | typeof defaultPath;

const paths = [
  ...Object.values(pathsWithCustomBackground),
  defaultPath,
] as Array<PathsWithBackground>;

function getSnapshot(): string {
  return currentPathName || (window.location.pathname.split('/')[2] ?? '');
}

function getServerSnapshot(): string {
  return '';
}

type LocationChangeCustomType = CustomEvent<string>;

function subscribe(onStoreChange: () => void) {
  const locationChangeHandler = (event: Event) => {
    currentPathName = (event as LocationChangeCustomType).detail.split('/')[1] ?? '';
    onStoreChange();
  };
  window.addEventListener('locationChangeCustom', locationChangeHandler);
  window.addEventListener('popstate', onStoreChange);

  return () => {
    window.removeEventListener('locationChangeCustom', locationChangeHandler);
    window.removeEventListener('popstate', onStoreChange);
  };
}

export const BackgroundContainer = () => {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const activePath = (
    paths.includes(current as PathsWithBackground) ? current : defaultPath
  ) as PathsWithBackground;

  return (
    <div className="global-background-container" aria-hidden>
      {paths.map((path, index) => {
        const isActive = activePath === path;
        return (
          <div
            key={path}
            // className={cn(styles.item, `${styles.item}-${index}`, isActive && styles.active)}
            className={`global-background-item global-background-item-${index} ${isActive ? 'global-background-item-active' : ''} `}
          />
        );
      })}
    </div>
  );
};
