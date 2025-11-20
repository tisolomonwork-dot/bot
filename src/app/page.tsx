'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BtcIcon } from '@/components/icons/crypto';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const { user, loading, signIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/menu');
    }
  }, [user, router]);

  // If loading, show skeleton. This is crucial for redirect flow on mobile.
  // It prevents the page from rendering the sign-in button before getRedirectResult can complete.
  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-40 w-full" />
            </div>
        </div>
    );
  }

  // If there's a user, the useEffect above will trigger a redirect.
  // We can return a loading state here as well to prevent a flash of the login form.
  if (user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-40 w-full" />
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
