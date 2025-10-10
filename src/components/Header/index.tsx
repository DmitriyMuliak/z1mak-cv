'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { paths } from '@/i18n/routing';
import styles from './styles.module.css';
import { useOptimistic, useEffect, startTransition, useState } from 'react';
import { cn } from '@/lib/utils';
import { Hamburger, SquareX } from 'lucide-react';

export const Header = () => {
  const [isClosed, setIsClosed] = useState(true);
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
    <header className={cn(styles.header)}>
      <button onClick={() => setIsClosed(false)} className={styles.openBtn}>
        <Hamburger size={30} />
      </button>
      <nav className={cn(styles.nav, isClosed ? styles.navClosed : '')}>
        <button onClick={() => setIsClosed(true)} className={styles.closeBtn}>
          <SquareX size={30} />
        </button>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.navLink}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('locationChangeCustom', { detail: link.href }));
              startTransition(() => {
                setOptimisticPathname(link.href);
              });
            }}
          >
            <span
              className={cn(
                styles.linkText,
                optimisticPathname === link.href ? styles.linkTextActive : '',
              )}
            >
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </header>
  );
};
