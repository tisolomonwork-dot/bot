import { TotalPortfolio } from '@/components/dashboard/total-portfolio';
import { AiOpinionPanel } from '@/components/dashboard/ai-opinion-panel';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { DetailedChart } from '@/components/dashboard/detailed-chart';
import { PositionsAndOrders } from '@/components/dashboard/positions-and-orders';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <TotalPortfolio />
          <Suspense fallback={<Skeleton className="h-full min-h-[190px] rounded-lg" />}>
            <AiOpinionPanel />
          </Suspense>
        </div>
        <DetailedChart />
        <PositionsAndOrders />
      </div>
      <MarketOverview />
    </div>
  );
}
