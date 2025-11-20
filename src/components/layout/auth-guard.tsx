'use client';

import { useUser } from '@/firebase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const unprotectedRoutes = ['/'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && !unprotectedRoutes.includes(pathname)) {
            router.push('/');
        }
    }, [user, loading, router, pathname]);


    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-40 w-full max-w-sm mt-4" />
            </div>
        )
    }

    if (!user && !unprotectedRoutes.includes(pathname)) {
        return null;
    }
    
    // Special case for login page
    if (user && pathname === '/') {
        // Content will be rendered by login page which handles its own redirect
        return <>{children}</>;
    }

    return <>{children}</>;
}
