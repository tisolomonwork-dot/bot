import { Suspense } from 'react';
import { CandlestickChart } from '@/components/dashboard/candlestick-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AITabContent } from './ai-tab-content';
import { Card } from '../ui/card';

interface ChartTabsProps {
  takeProfit?: number;
  stopLoss?: number;
  entryPrice?: number;
}

export function ChartTabs({ takeProfit, stopLoss, entryPrice }: ChartTabsProps) {
  return (
    <Tabs defaultValue="chart" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="ai-opinion">A.I. Opinion</TabsTrigger>
      </TabsList>
      <TabsContent value="chart">
         <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
            <CandlestickChart takeProfit={takeProfit} stopLoss={stopLoss} entryPrice={entryPrice} />
        </Suspense>
      </TabsContent>
      <TabsContent value="ai-opinion">
        <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5 h-[532px]">
            <Suspense fallback={<Skeleton className="h-[500px] rounded-xl" />}>
                <AITabContent />
            </Suspense>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
