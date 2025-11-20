"use client";

import { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getKlines, getTickers } from "@/lib/services/bybit-service";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
};

type KlineInterval = '15' | '30' | '60' | '240' | 'D';

type KlineData = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface DetailedChartProps {
    takeProfit?: number;
    stopLoss?: number;
}

export function DetailedChart({ takeProfit, stopLoss }: DetailedChartProps) {
    const [chartData, setChartData] = useState<KlineData[]>([]);
    const [ticker, setTicker] = useState<{lastPrice: string, price24hPcnt: string} | null>(null);
    const [interval, setInterval] = useState<KlineInterval>('60');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [klinesData, tickerData] = await Promise.all([
                getKlines({
                    category: 'linear',
                    symbol: 'BTCUSDT',
                    interval: interval,
                    limit: 100,
                }),
                getTickers({ category: 'linear', symbol: 'BTCUSDT' }),
            ]);
            setChartData(klinesData);
            if (tickerData.length > 0) {
                setTicker(tickerData[0]);
            }
            setLoading(false);
        }
        fetchData();

        const priceInterval = setInterval(async () => {
             const tickerData = await getTickers({ category: 'linear', symbol: 'BTCUSDT' });
             if (tickerData.length > 0) {
                setTicker(tickerData[0]);
            }
        }, 3000);

        return () => clearInterval(priceInterval);
    }, [interval]);

    const priceChangePercent = ticker ? parseFloat(ticker.price24hPcnt) * 100 : 0;
    
    const yAxisDomain = loading || chartData.length === 0 
    ? ['auto', 'auto'] 
    : [
        Math.min(...chartData.map(d => d.low)) * 0.995,
        Math.max(...chartData.map(d => d.high)) * 1.005
      ];
    
    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

  return (
    <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5 h-full">
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-baseline gap-4">
          <CardTitle>BTC/USD</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
                {ticker ? parseFloat(ticker.lastPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : <Skeleton className="h-8 w-24" />}
            </span>
             <span className={cn("text-sm font-medium flex items-center", priceChangePercent >= 0 ? "text-positive" : "text-negative")}>
                <TrendingUp className={cn("h-4 w-4 mr-1", priceChangePercent < 0 && "rotate-180")} />
                {priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <Tabs defaultValue={interval} onValueChange={(value) => setInterval(value as KlineInterval)}>
            <TabsList>
                <TabsTrigger value="15">15m</TabsTrigger>
                <TabsTrigger value="30">30m</TabsTrigger>
                <TabsTrigger value="60">1h</TabsTrigger>
                <TabsTrigger value="240">4h</TabsTrigger>
                <TabsTrigger value="D">1d</TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0 h-[420px]">
        {loading ? (
            <Skeleton className="h-full w-full" />
        ) : (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 5,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={50}
              interval="preserveStartEnd"
            />
            <YAxis 
                orientation="right" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
                domain={yAxisDomain}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor
              content={<ChartTooltipContent indicator="line" labelFormatter={(label, payload) => new Date(label).toLocaleString()} />}
            />
            <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <Area
              dataKey="close"
              type="natural"
              fill="url(#fillPrice)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              stackId="a"
              connectNulls
            />
            {takeProfit && (
                <ReferenceLine y={takeProfit} label={{ value: "TP", position: 'insideTopRight', fill: 'hsl(var(--positive))', fontSize: 12 }} stroke="hsl(var(--positive))" strokeDasharray="3 3" />
            )}
            {stopLoss && (
                <ReferenceLine y={stopLoss} label={{ value: "SL", position: 'insideBottomRight', fill: 'hsl(var(--negative))', fontSize: 12 }} stroke="hsl(var(--negative))" strokeDasharray="3 3" />
            )}
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
