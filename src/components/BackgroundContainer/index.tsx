'use client';

import { defaultPath, pathsWithCustomBackground, pathsList, PathsWithBackground } from './consts';
import { usePathname } from '@/i18n/navigation';

export const BackgroundContainer = () => {
  const pathName = usePathname() as PathsWithBackground;
  const activePath = pathsWithCustomBackground[pathName] ? pathName : defaultPath;

  return (
    <div className="global-background-container" aria-hidden>
      {pathsList.map((path, index) => {
        const isActive = activePath === path;
        return (
          <div
            key={path}
            className={`global-background-item global-background-item-${index} ${isActive ? 'global-background-item-active' : ''}`}
          />
        );
      })}
    </div>
  );
};
