"use client";

import { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

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

type KlineInterval = '1' | '15' | '30' | '60' | '240' | 'D';

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
                    limit: 50,
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
    }, [interval]);

    const priceChangePercent = ticker ? parseFloat(ticker.price24hPcnt) * 100 : 0;
    
    const yAxisDomain = loading || chartData.length === 0 
    ? ['auto', 'auto'] 
    : [
        Math.min(...chartData.map(d => d.low)) * 0.998,
        Math.max(...chartData.map(d => d.high)) * 1.002
      ];


  return (
    <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>BTC/USD</CardTitle>
                {ticker ? (
                     <CardDescription>
                        <span className="text-3xl font-bold mr-2">${parseFloat(ticker.lastPrice).toLocaleString()}</span>
                        <span className={cn("text-sm font-medium", priceChangePercent >= 0 ? "text-positive" : "text-negative")}>
                            {priceChangePercent.toFixed(2)}%
                        </span>
                    </CardDescription>
                ) : (
                    <Skeleton className="h-9 w-48 mt-1" />
                )}
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
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <Skeleton className="h-[400px] w-full" />
        ) : (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                left: 0,
                right: 12,
                top: 10,
                bottom: 0
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                    const date = new Date(value);
                    if (interval === 'D') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                }}
                />
                <YAxis domain={yAxisDomain} tickLine={false} axisLine={false} tickMargin={8} orientation="right" tickFormatter={(value) => `$${(typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) : 0)}`} />
                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" labelFormatter={(label) => new Date(label).toLocaleString()} />} />
                <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                    />
                    <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                    />
                </linearGradient>
                </defs>
                <Area
                    dataKey="close"
                    type="natural"
                    fill="url(#fillPrice)"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    stackId="a"
                    dot={false}
                />
                {takeProfit && <ReferenceLine y={takeProfit} label={{ value: 'TP', position: 'right', fill: 'hsl(var(--positive))' }} stroke="hsl(var(--positive))" strokeDasharray="3 3" />}
                {stopLoss && <ReferenceLine y={stopLoss} label={{ value: 'SL', position: 'right', fill: 'hsl(var(--negative))' }} stroke="hsl(var(--negative))" strokeDasharray="3 3" />}
            </AreaChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
