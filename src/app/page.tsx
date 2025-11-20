import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CandlestickChart } from '@/components/dashboard/candlestick-chart';
import { TradePanel } from '@/components/dashboard/trade-panel';
import { BalancePnl } from '@/components/dashboard/balance-pnl';
import { ActiveTrade } from '@/components/dashboard/active-trade';
import { getPositions } from '@/lib/services/bybit-service';
import { FloatingChat } from '@/components/dashboard/floating-chat';

export default async function DashboardPage() {
  const positions = await getPositions();
  const btcPosition = positions.find(p => p.symbol === 'BTCUSDT');

  const takeProfit = btcPosition?.takeProfit ? parseFloat(btcPosition.takeProfit) : undefined;
  const stopLoss = btcPosition?.stopLoss ? parseFloat(btcPosition.stopLoss) : undefined;
  const entryPrice = btcPosition?.avgPrice ? parseFloat(btcPosition.avgPrice) : undefined;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
            <BalancePnl />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <Suspense fallback={<Skeleton className="h-32 rounded-xl lg:col-span-4" />}>
                <ActiveTrade btcPosition={btcPosition} />
            </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
              <CandlestickChart takeProfit={takeProfit} stopLoss={stopLoss} entryPrice={entryPrice} />
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
