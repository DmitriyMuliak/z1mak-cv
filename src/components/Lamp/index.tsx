'use client';

import { useTheme } from 'next-themes';
import { LightSwitch } from '@/components/LightSwitch';
import styles from './styles.module.css';

export const Lamp: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleLamp = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className={styles.container}>
      <div data-on={isDark ? 'true' : 'false'} className={styles.lamp}>
        <svg viewBox="0 0 64 64" className={styles.bulb} aria-hidden>
          <g className={styles.filament}>
            <path d="M20 28c0-8 6-14 12-14s12 6 12 14c0 6-4 10-6 12-2 2-4 4-6 4s-4-2-6-4c-2-2-6-6-6-12z" />
          </g>
          <rect x="26" y="40" width="12" height="8" rx="1" />
          <rect x="22" y="48" width="20" height="6" rx="1" />
        </svg>
      </div>
      <LightSwitch onClick={toggleLamp} isOn={isDark} />
    </div>
  );
};
