'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { paths } from '@/i18n/routing';
import styles from './styles.module.css';
import { useOptimistic, useEffect, startTransition } from 'react';

export const Header = () => {
  const realPathname = usePathname();
  const [optimisticPathname, setOptimisticPathname] = useOptimistic(realPathname);
  const t = useTranslations('header.menu');

  const links = [
    { href: paths.about, label: t('aboutTitle') },
    { href: paths.skills, label: t('skillsTitle') },
    { href: paths.contact, label: t('contactTitle') },
    { href: paths.cvChecker, label: t('cvCheckerTitle') },
  ];

  useEffect(() => {
    startTransition(() => {
      setOptimisticPathname(realPathname);
    });
  }, [realPathname, setOptimisticPathname]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={optimisticPathname === link.href ? styles.active : ''}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('locationChangeCustom', { detail: link.href }));
              startTransition(() => {
                setOptimisticPathname(link.href);
              });
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
