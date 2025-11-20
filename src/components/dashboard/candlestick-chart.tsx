
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type Time, type IPriceLine, LineStyle } from 'lightweight-charts';
import { getKlines, getTickers } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface CandlestickChartProps {
    takeProfit?: number;
    stopLoss?: number;
    entryPrice?: number;
}

export function CandlestickChart({ takeProfit, stopLoss, entryPrice }: CandlestickChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const ma200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const [loading, setLoading] = useState(true);
    const [ticker, setTicker] = useState<{lastPrice: string, price24hPcnt: string} | null>(null);
    const [tpLine, setTpLine] = useState<IPriceLine | null>(null);
    const [slLine, setSlLine] = useState<IPriceLine | null>(null);
    const [entryLine, setEntryLine] = useState<IPriceLine | null>(null);

    const handleResize = useCallback(() => {
        if (chartApiRef.current && chartContainerRef.current) {
            chartApiRef.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
        }
    }, []);
    
    const calculateMA = (data: { time: Time, close: number }[], period: number) => {
        let result: { time: Time, value: number }[] = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period -1) {
                result.push({ time: data[i].time, value: NaN });
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i-j].close;
                }
                result.push({ time: data[i].time, value: sum / period });
            }
        }
        return result;
    }

    const fetchData = useCallback(async (series: ISeriesApi<'Candlestick'> | null, maSeries: ISeriesApi<'Line'> | null) => {
        setLoading(true);
        const [klinesData, tickerData] = await Promise.all([
            getKlines({
                category: 'linear',
                symbol: 'BTCUSDT',
                interval: '30',
                limit: 300,
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

            if (maSeries) {
                const ma200Data = calculateMA(formattedData, 200);
                maSeries.setData(ma200Data);
            }

            chartApiRef.current?.timeScale().fitContent();
        }

        if (tickerData.length > 0) {
            setTicker(tickerData[0]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 420,
            layout: {
                background: { color: 'transparent' },
                textColor: 'rgba(132, 142, 156, 1)',
            },
            grid: {
                vertLines: { color: 'rgba(48, 54, 69, 0.5)' },
                horzLines: { color: 'rgba(48, 54, 69, 0.5)' },
            },
            timeScale: {
                borderColor: 'rgba(48, 54, 69, 1)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(48, 54, 69, 1)',
            },
        });

        const series = chart.addCandlestickSeries({
            upColor: 'rgba(57, 166, 103, 1)',
            downColor: 'rgba(215, 84, 84, 1)',
            borderDownColor: 'rgba(215, 84, 84, 1)',
            borderUpColor: 'rgba(57, 166, 103, 1)',
            wickDownColor: 'rgba(215, 84, 84, 1)',
            wickUpColor: 'rgba(57, 166, 103, 1)',
        });
        
        const maSeries = chart.addLineSeries({
            color: 'rgba(255, 165, 0, 0.8)',
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
        });

        chartApiRef.current = chart;
        candlestickSeriesRef.current = series;
        ma200SeriesRef.current = maSeries;


        window.addEventListener('resize', handleResize);
        
        fetchData(series, maSeries);
        const dataInterval = setInterval(() => fetchData(series, maSeries), 30000); // Refresh klines every 30s

        return () => {
            clearInterval(dataInterval);
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [fetchData, handleResize]);


    useEffect(() => {
        const priceInterval = setInterval(async () => {
             const tickerData = await getTickers({ category: 'linear', symbol: 'BTCUSDT' });
             if (tickerData.length > 0) {
                setTicker(tickerData[0]);
            }
        }, 3000);

        return () => clearInterval(priceInterval);
    }, []);

    // Update TP/SL/Entry lines
    useEffect(() => {
        if (!candlestickSeriesRef.current) return;
        const series = candlestickSeriesRef.current;

        // Remove old lines if they exist
        if (tpLine) series.removePriceLine(tpLine);
        if (slLine) series.removePriceLine(slLine);
        if (entryLine) series.removePriceLine(entryLine);

        // Add new lines
        if (takeProfit) {
            const newTpLine = series.createPriceLine({
                price: takeProfit,
                color: 'rgba(57, 166, 103, 1)',
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'TP',
            });
            setTpLine(newTpLine);
        }
        if (stopLoss) {
            const newSlLine = series.createPriceLine({
                price: stopLoss,
                color: 'rgba(215, 84, 84, 1)',
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'SL',
            });
            setSlLine(newSlLine);
        }
        if (entryPrice) {
            const newEntryLine = series.createPriceLine({
                price: entryPrice,
                color: 'rgba(255, 255, 255, 0.7)',
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: 'Entry',
            });
            setEntryLine(newEntryLine);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [takeProfit, stopLoss, entryPrice]);

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
                 <span className="text-sm text-muted-foreground">30m</span>
            </CardHeader>
            <CardContent className="pt-0 h-[420px] relative">
                {loading && <Skeleton className="absolute inset-0 h-full w-full" />}
                <div ref={chartContainerRef} className={cn("h-full w-full", loading && "opacity-0")} />
            </CardContent>
        </Card>
    );
}
