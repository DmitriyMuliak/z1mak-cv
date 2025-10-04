'use client';

import { useSyncExternalStore } from 'react';
import { menuPaths } from '@/i18n/routing';

let currentPathName = '';
type MenuPaths = keyof typeof menuPaths;
const paths = Object.values(menuPaths) as Array<MenuPaths>;

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
  const activePath = (paths.includes(current as MenuPaths) ? current : paths[0]) as MenuPaths;

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
