'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TradePanel } from '@/components/dashboard/trade-panel';
import { BalancePnl } from '@/components/dashboard/balance-pnl';
import { ActiveTrade } from '@/components/dashboard/active-trade';
import { FloatingChat } from '@/components/dashboard/floating-chat';
import { CandlestickChart } from '@/components/dashboard/candlestick-chart';
import { AiOpinionCard } from '@/components/dashboard/ai-opinion-card';
import { Header } from '@/components/layout/header';


export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
            <BalancePnl />
            </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
                <ActiveTrade />
            </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
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
    </div>
  );
}
