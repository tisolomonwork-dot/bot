"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { getKlines, getTickers } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

type KlineInterval = '15' | '30' | '60' | '240' | 'D';

interface CandlestickChartProps {
    takeProfit?: number;
    stopLoss?: number;
}

export function CandlestickChart({ takeProfit, stopLoss }: CandlestickChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const [interval, setInterval] = useState<KlineInterval>('60');
    const [loading, setLoading] = useState(true);
    const [ticker, setTicker] = useState<{lastPrice: string, price24hPcnt: string} | null>(null);

    const handleResize = useCallback(() => {
        if (chartApiRef.current && chartContainerRef.current) {
            chartApiRef.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight,
            });
        }
    }, []);
    
    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartApiRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 420,
            layout: {
                background: { color: 'transparent' },
                textColor: 'hsl(var(--muted-foreground))',
            },
            grid: {
                vertLines: { color: 'hsl(var(--border) / 0.5)' },
                horzLines: { color: 'hsl(var(--border) / 0.5)' },
            },
            timeScale: {
                borderColor: 'hsl(var(--border))',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'hsl(var(--border))',
            },
        });

        candlestickSeriesRef.current = chartApiRef.current.addCandlestickSeries({
            upColor: 'hsl(var(--positive))',
            downColor: 'hsl(var(--negative))',
            borderDownColor: 'hsl(var(--negative))',
            borderUpColor: 'hsl(var(--positive))',
            wickDownColor: 'hsl(var(--negative))',
            wickUpColor: 'hsl(var(--positive))',
        });

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartApiRef.current?.remove();
        };
    }, [handleResize]);

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
            
            if (klinesData && candlestickSeriesRef.current) {
                const formattedData = klinesData.map(d => ({
                    time: (new Date(d.date).getTime() / 1000) as Time,
                    open: d.open,
                    high: d.high,
                    low: d.low,
                    close: d.close,
                }));
                candlestickSeriesRef.current.setData(formattedData);
                chartApiRef.current?.timeScale().fitContent();
            }

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

    // Update TP/SL lines
    useEffect(() => {
        if (!candlestickSeriesRef.current) return;
        
        const series = candlestickSeriesRef.current;
        const currentLines = series.priceLines();
        currentLines.forEach(line => series.removePriceLine(line));

        if (takeProfit) {
            series.createPriceLine({
                price: takeProfit,
                color: 'hsl(var(--positive))',
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'TP',
            });
        }
        if (stopLoss) {
            series.createPriceLine({
                price: stopLoss,
                color: 'hsl(var(--negative))',
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'SL',
            });
        }
    }, [takeProfit, stopLoss]);

    const priceChangePercent = ticker ? parseFloat(ticker.price24hPcnt) * 100 : 0;

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
            <CardContent className="pt-0 h-[420px] relative">
                {loading && <Skeleton className="absolute inset-0 h-full w-full" />}
                <div ref={chartContainerRef} className={cn("h-full w-full", loading && "opacity-0")} />
            </CardContent>
        </Card>
    );
}