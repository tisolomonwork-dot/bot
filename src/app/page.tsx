import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedChart } from '@/components/dashboard/detailed-chart';
import { TradePanel } from '@/components/dashboard/trade-panel';
import { BalancePnl } from '@/components/dashboard/balance-pnl';
import { ActiveTrade } from '@/components/dashboard/active-trade';
import { FloatingChat } from '@/components/dashboard/floating-chat';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<Skeleton className="h-24 rounded-lg" />}>
            <BalancePnl />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-24 rounded-lg" />}>
            <ActiveTrade />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DetailedChart />
          </div>
          <div className="lg:col-span-2">
            <TradePanel />
          </div>
        </div>
      </main>
      <FloatingChat />
    </div>
  );
}
