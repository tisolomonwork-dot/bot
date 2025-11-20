'use client';

import { useUser } from '@/firebase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardContent } from '../ui/card';


const unprotectedRoutes = ['/'];

function LoadingScreen() {
    return (
         <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-sm space-y-4 p-4">
                 <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex justify-center">
                           <Skeleton className="h-12 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const isUnprotected = unprotectedRoutes.includes(pathname);

    useEffect(() => {
        // If loading is finished
        if (!loading) {
            // If there is a user
            if (user) {
                // If they are on the login page, redirect them to the menu.
                if (isUnprotected) {
                    router.push('/menu');
                }
            } else {
                // If there's no user and they are on a protected page, redirect to login.
                if (!isUnprotected) {
                    router.push('/');
                }
            }
        }
    }, [user, loading, router, pathname, isUnprotected]);


    // While loading, show a full-page loading screen.
    if (loading) {
        return <LoadingScreen />;
    }

    // If loading is finished, and the logic in useEffect is running,
    // we might need to show a loading screen to prevent content flashes.
    if (user && isUnprotected) {
         // User is logged in but still on the login page, waiting for redirect.
        return <LoadingScreen />;
    }

    if (!user && !isUnprotected) {
        // User is not logged in and on a protected page, waiting for redirect.
        return <LoadingScreen />;
    }

    // If all checks pass, render the requested page.
    return <>{children}</>;
}
