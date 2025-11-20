'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { BtcIcon } from '@/components/icons/crypto';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const { user, loading, signIn } = useUser();
  
  // The AuthGuard will handle redirecting the user if they are already logged in.
  // This component only needs to handle the display of the login UI.

  if (loading || user) {
    // Show a loading state to prevent a flash of the login button
    // while the AuthGuard determines where to route the user.
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
    );
  }

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
            <Button onClick={() => signIn('google')} className="w-full" variant="outline">
                Sign In with Google
            </Button>
        </CardContent>
       </Card>
    </main>
  );
}
