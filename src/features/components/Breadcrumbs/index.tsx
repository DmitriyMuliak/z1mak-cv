'use client';

import { usePathname } from '@/i18n/navigation';
import type { MessagesBase } from '@/types/translations';
import { BookOpenCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { Fragment } from 'react';

type BreadCrumbsKeys = keyof MessagesBase['pages']['cvChecker']['breadCrumbs'];
type RoutesEndPart = string; // last part of paths divided by '/' without '/'

// Can be extended to all pages in app (add mapping for route > segments in route)
const routeLabels: Record<RoutesEndPart, BreadCrumbsKeys> = {
  ['cv-checker']: 'cvChecker',
  ['report']: 'report',
};

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const tbc = useTranslations('pages.cvChecker.breadCrumbs');

  const crumbs = pathname.split('/').filter((item) => item !== '');

  if (crumbs.length === 0) return null;
  // if (crumbs.length === 1 && crumbs[0] === 'cv-checker') return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 block">
      <ol className="flex items-center space-x-2 text-sm" color="text-card-foreground">
        <li>
          <BookOpenCheck />
        </li>

        {crumbs.map((segment, index) => {
          const href = `/${crumbs.slice(0, index + 1).join('/')}`;
          const isLast = index === crumbs.length - 1;
          const label = tbc(routeLabels[segment]);

          return (
            <Fragment key={href}>
              <li className="text-card-foreground ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </li>

              <li>
                {isLast ? (
                  <span
                    className="font-medium text-card-foreground border-b border-transparent"
                    aria-current="page"
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-card-foreground border-b border-transparent hover:border-[hsl(var(--card-foreground))]"
                  >
                    {label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
