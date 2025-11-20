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
    const isUnprotected = unprotectedRoutes.includes(pathname);

    useEffect(() => {
        // If not loading, not logged in, and trying to access a protected route
        if (!loading && !user && !isUnprotected) {
            router.push('/');
        }
    }, [user, loading, router, pathname, isUnprotected]);


    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-40 w-full max-w-sm mt-4" />
            </div>
        );
    }
    
    // If not logged in and on a protected route, return null to prevent rendering children.
    // The useEffect above will handle the redirect.
    if (!user && !isUnprotected) {
        return null;
    }

    // If logged in and on the login page, let the login page handle the redirect.
    // This prevents a flash of content while redirecting.
    if (user && isUnprotected) {
         return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-40 w-full max-w-sm mt-4" />
            </div>
        );
    }

    // Otherwise, render the children
    return <>{children}</>;
}
