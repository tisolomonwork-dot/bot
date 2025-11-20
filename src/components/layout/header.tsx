'use client';

import Link from 'next/link';
import { BtcIcon } from '../icons/crypto';
import { Breadcrumbs } from './breadcrumbs';
import { UserNav } from './user-nav';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/menu" className="flex items-center gap-2 font-semibold">
          <BtcIcon className="h-6 w-6 text-primary" />
          <span className="sr-only">AetherMind Trading</span>
        </Link>
        <Breadcrumbs />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
          <UserNav />
        </Suspense>
      </div>
    </header>
  );
}
