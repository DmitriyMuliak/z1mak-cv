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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realPathname]);

  const links = [
    { href: paths.home, label: t('aboutTitle') },
    { href: paths.skills, label: t('skillsTitle') },
    { href: paths.contact, label: t('contactTitle') },
    { href: paths.cvChecker, label: t('cvCheckerTitle') },
  ];

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
          <Link key={link.href} href={link.href} className={styles.navLink}>
            <span
              className={cn(
                styles.linkText,
                realPathname === link.href ? styles.linkTextActive : '',
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
