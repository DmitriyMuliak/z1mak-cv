'use client';

import { useSyncExternalStore } from 'react';
import { defaultPath, paths, PathsWithBackground } from './consts';
let currentPathName = '';

function getPathNameWithoutLocale(location: typeof window.location) {
  return location.pathname.split('/')[2] ?? '';
}

function getSnapshot(): string {
  return currentPathName || getPathNameWithoutLocale(window.location);
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
  const popStateHandler = (event: Event) => {
    currentPathName = getPathNameWithoutLocale((event.currentTarget as Window).location);
    onStoreChange();
  };
  window.addEventListener('locationChangeCustom', locationChangeHandler);
  window.addEventListener('popstate', popStateHandler);

  return () => {
    window.removeEventListener('locationChangeCustom', locationChangeHandler);
    window.removeEventListener('popstate', popStateHandler);
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
            className={`global-background-item global-background-item-${index} ${isActive ? 'global-background-item-active' : ''} `}
          />
        );
      })}
    </div>
  );
};
