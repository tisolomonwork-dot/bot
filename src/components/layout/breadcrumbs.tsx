"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

  if (segments.length === 0 || segments[0] === 'menu') {
    return null; // Don't show breadcrumbs on the root menu page
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/menu" className="hover:text-foreground">
        Menu
      </Link>
      <ChevronRight className="h-4 w-4" />
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        return (
          <Fragment key={href}>
            <Link
              href={href}
              className={cn(
                'hover:text-foreground',
                isLast ? 'text-foreground font-medium' : ''
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {capitalize(segment)}
            </Link>
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
