'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/navigation';
import { useEffect, useState } from 'react';
import { Hamburger, SquareX } from 'lucide-react';

import { cn } from '@/lib/utils';
import { paths } from '@/consts/routes';
import { Link } from '@/navigation';
import styles from './styles.module.css';

export const Header = () => {
  const [isClosed, setIsClosed] = useState(true);
  const realPathname = usePathname();
  const t = useTranslations('header.menu');

  useEffect(() => {
    if (!isClosed) setIsClosed(true);
  }, [realPathname]);

  const links = [
    { id: 'home', href: paths.home, label: t('aboutTitle') },
    { id: 'skills', href: paths.skills, label: t('skillsTitle') },
    { id: 'contact', href: paths.contact, label: t('contactTitle') },
    { id: 'cv-checker', href: paths.cvChecker, label: t('cvCheckerTitle') },
  ];

  return (
    <header className={cn(styles.header)}>
      <button
        onClick={() => setIsClosed(false)}
        className={styles.openBtn}
        aria-label={t('openMenu')}
      >
        <Hamburger size={30} />
      </button>
      <nav className={cn(styles.nav, isClosed && styles.navClosed)}>
        <button
          onClick={() => setIsClosed(true)}
          className={styles.closeBtn}
          aria-label={t('closeMenu')}
        >
          <SquareX size={30} />
        </button>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.navLink}
            data-testid={`nav-link-${link.id}`}
          >
            <span
              className={cn(
                styles.linkText,
                realPathname.startsWith(link.href) ? styles.linkTextActive : '',
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
