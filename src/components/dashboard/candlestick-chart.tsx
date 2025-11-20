
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
            });
        }
    }, []);
    
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 420,
            layout: {
                background: { color: 'transparent' },
                textColor: 'hsl(215, 16%, 57%)',
            },
            grid: {
                vertLines: { color: 'hsla(215, 14%, 24%, 0.5)' },
                horzLines: { color: 'hsla(215, 14%, 24%, 0.5)' },
            },
            timeScale: {
                borderColor: 'hsl(215, 14%, 24%)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'hsl(215, 14%, 24%)',
            },
        });

        const series = chart.addCandlestickSeries({
            upColor: 'hsl(142, 71%, 45%)',
            downColor: 'hsl(0, 72%, 51%)',
            borderDownColor: 'hsl(0, 72%, 51%)',
            borderUpColor: 'hsl(142, 71%, 45%)',
            wickDownColor: 'hsl(0, 72%, 51%)',
            wickUpColor: 'hsl(142, 71%, 45%)',
        });

        chartApiRef.current = chart;
        candlestickSeriesRef.current = series;

        window.addEventListener('resize', handleResize);
        
        // Initial data fetch
        fetchData(interval, series);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    const fetchData = useCallback(async (newInterval: KlineInterval, series: ISeriesApi<'Candlestick'> | null) => {
        setLoading(true);
        const [klinesData, tickerData] = await Promise.all([
            getKlines({
                category: 'linear',
                symbol: 'BTCUSDT',
                interval: newInterval,
                limit: 100,
            }),
            getTickers({ category: 'linear', symbol: 'BTCUSDT' }),
        ]);
        
        if (klinesData && series) {
            const formattedData = klinesData.map(d => ({
                time: (new Date(d.date).getTime() / 1000) as Time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }));
            series.setData(formattedData);
            chartApiRef.current?.timeScale().fitContent();
        }

        if (tickerData.length > 0) {
            setTicker(tickerData[0]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        if (candlestickSeriesRef.current) {
            fetchData(interval, candlestickSeriesRef.current);
        }
    }, [interval, fetchData]);

    useEffect(() => {
        const priceInterval = setInterval(async () => {
             const tickerData = await getTickers({ category: 'linear', symbol: 'BTCUSDT' });
             if (tickerData.length > 0) {
                setTicker(tickerData[0]);
            }
        }, 3000);

        return () => clearInterval(priceInterval);
    }, []);

    // Update TP/SL lines
    useEffect(() => {
        if (!candlestickSeriesRef.current) return;
        
        const series = candlestickSeriesRef.current;
        const currentLines = series.priceLines();
        currentLines.forEach(line => series.removePriceLine(line));

        if (takeProfit) {
            series.createPriceLine({
                price: takeProfit,
                color: 'hsl(142, 71%, 45%)',
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'TP',
            });
        }
        if (stopLoss) {
            series.createPriceLine({
                price: stopLoss,
                color: 'hsl(0, 72%, 51%)',
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

    