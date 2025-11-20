'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TradePanel } from '@/components/dashboard/trade-panel';
import { BalancePnl } from '@/components/dashboard/balance-pnl';
import { ActiveTrade } from '@/components/dashboard/active-trade';
import { FloatingChat } from '@/components/dashboard/floating-chat';
import { CandlestickChart } from '@/components/dashboard/candlestick-chart';
import { AiOpinionCard } from '@/components/dashboard/ai-opinion-card';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function SignInPrompt() {
    const { signIn } = useUser();
    return (
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Please Sign In</h2>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground">You need to be logged in to view your investment dashboard.</p>
                    <Button onClick={() => signIn('google')} className="w-full">Sign In with Google</Button>
                </CardContent>
            </Card>
        </main>
    )
}

function DashboardSkeleton() {
    return (
        <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-8">
                <Skeleton className="h-40 rounded-xl lg:col-span-4" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-8">
                <div className="lg:col-span-2 flex flex-col gap-4 md:gap-8">
                    <Skeleton className="h-[240px] rounded-xl" />
                    <Skeleton className="h-[500px] rounded-xl" />
                </div>
                <div>
                    <Skeleton className="h-[500px] rounded-xl" />
                </div>
            </div>
        </main>
    );
}

export default function InvestmentsPage() {
    const { user, loading } = useUser();

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!user) {
        return <SignInPrompt />;
    }

  return (
    <main className="flex-1 space-y-4 p-4 md:space-y-8 md:p-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
        <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
          <BalancePnl />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
          <Suspense fallback={<Skeleton className="h-32 rounded-xl lg:col-span-4" />}>
              <ActiveTrade />
          </Suspense>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-8">
           <Suspense fallback={<Skeleton className="h-[240px] rounded-xl" />}>
              <AiOpinionCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
            <CandlestickChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
            <TradePanel />
          </Suspense>
        </div>
      </div>
      <FloatingChat />
    </main>
  );
}
