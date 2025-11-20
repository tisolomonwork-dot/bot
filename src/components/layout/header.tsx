'use client';

import Link from 'next/link';
import { BtcIcon } from '../icons/crypto';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-card-foreground">
          <BtcIcon className="h-5 w-5 text-primary" />
          <span className="">AetherMind</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
      </div>
    </header>
  );
}
