'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { BtcIcon } from '../icons/crypto';
import { Button } from '../ui/button';


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

function LoginPage() {
  const { signIn, loading } = useUser();

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center p-4 bg-background">
       <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
                <BtcIcon className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">AetherMind Trading</CardTitle>
            <CardDescription>Sign in to access your AI-powered dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => signIn('google')} className="w-full" variant="outline" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In with Google'}
            </Button>
        </CardContent>
       </Card>
    </main>
  );
}


export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();

    if (loading) {
        return <LoadingScreen />;
    }
    
    if (!user) {
        return <LoginPage />;
    }

    return <>{children}</>;
}
