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
    </Card>
  );
}
