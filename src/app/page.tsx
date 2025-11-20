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

  if (loading || user) {
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
