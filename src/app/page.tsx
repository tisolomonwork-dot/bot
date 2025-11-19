import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailedChart } from '@/components/dashboard/detailed-chart';
import { TradePanel } from '@/components/dashboard/trade-panel';
import { BalancePnl } from '@/components/dashboard/balance-pnl';
import { ActiveTrade } from '@/components/dashboard/active-trade';
import { FloatingChat } from '@/components/dashboard/floating-chat';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
            <BalancePnl />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-32 rounded-xl lg:col-span-3" />}>
            <ActiveTrade />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
              <DetailedChart />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
              <TradePanel />
            </Suspense>
          </div>
        </div>
      </main>
      <FloatingChat />
    </div>
  );
}
