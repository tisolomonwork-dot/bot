
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
    const retracementLinesRef = useRef<{ line50: IPriceLine | null, line60: IPriceLine | null }>({ line50: null, line60: null });
    const [tpLine, setTpLine] = useState<IPriceLine | null>(null);
    const [slLine, setSlLine] = useState<IPriceLine | null>(null);
    const [entryLine, setEntryLine] = useState<IPriceLine | null>(null);

    const [loading, setLoading] = useState(true);
    const [ticker, setTicker] = useState<{lastPrice: string, price24hPcnt: string} | null>(null);
    
    const [marketSentiment, setMarketSentiment] = useState<'Bullish' | 'Bearish' | null>(null);
    const [priceProximityEmoji, setPriceProximityEmoji] = useState<string | null>(null);

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

    const fetchData = useCallback(async () => {
        if (!candlestickSeriesRef.current || !ma200SeriesRef.current) return;
        
        const series = candlestickSeriesRef.current;
        const maSeries = ma200SeriesRef.current;

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
        
        if (klinesData && klinesData.length > 0) {
            const formattedData = klinesData.map(d => ({
                time: (new Date(d.date).getTime() / 1000) as Time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }));
            series.setData(formattedData);

            const recentLow = Math.min(...formattedData.slice(-50).map(d => d.low));
            const recentHigh = Math.max(...formattedData.slice(-50).map(d => d.high));
            const range = recentHigh - recentLow;
            const level50 = recentLow + range * 0.5;
            const level60 = recentLow + range * 0.6;
            
            if (retracementLinesRef.current.line50) series.removePriceLine(retracementLinesRef.current.line50);
            retracementLinesRef.current.line50 = series.createPriceLine({
                price: level50,
                color: 'rgba(255, 193, 7, 0.5)',
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: '50%',
            });
            
            if (retracementLinesRef.current.line60) series.removePriceLine(retracementLinesRef.current.line60);
            retracementLinesRef.current.line60 = series.createPriceLine({
                price: level60,
                color: 'rgba(3, 169, 244, 0.5)',
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: '60%',
            });

            const ma200Data = calculateMA(formattedData, 200);
            maSeries.setData(ma200Data);

            const lastPrice = formattedData[formattedData.length - 1]?.close;
            const lastMa200 = ma200Data.filter(d => !isNaN(d.value)).pop()?.value;

            if (lastPrice && lastMa200) {
                setMarketSentiment(lastPrice > lastMa200 ? 'Bullish' : 'Bearish');
            } else {
                setMarketSentiment(null);
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
                background: { color: 'rgba(22, 24, 33, 1)' },
                textColor: 'rgba(209, 213, 219, 1)',
            },
            grid: {
                vertLines: { color: 'rgba(41, 45, 59, 1)' },
                horzLines: { color: 'rgba(41, 45, 59, 1)' },
            },
            timeScale: {
                borderColor: 'rgba(41, 45, 59, 1)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(41, 45, 59, 1)',
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

        fetchData();
        const dataInterval = setInterval(fetchData, 30000);

        window.addEventListener('resize', handleResize);
        
        return () => {
            clearInterval(dataInterval);
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [fetchData, handleResize]);


    useEffect(() => {
        const getEmoji = (price: number, tp: number, sl: number, entry: number) => {
            if (price <= sl) return '💀';
            if (price >= tp) return '💰';
            
            const range = tp - sl;
            const progress = (price - sl) / range;
            
            if (progress < 0.1) return '😨';
            if (progress < 0.3) return '🤔';
            if (progress < 0.7) return '👀';
            if (progress < 0.9) return '😎';
            return '🤑';
        }

        const priceInterval = setInterval(async () => {
             const tickerData = await getTickers({ category: 'linear', symbol: 'BTCUSDT' });
             if (tickerData.length > 0) {
                const newTicker = tickerData[0];
                setTicker(newTicker);
                
                const lastPrice = parseFloat(newTicker.lastPrice);
                candlestickSeriesRef.current?.update({
                    time: (Date.now() / 1000) as Time,
                    close: lastPrice,
                });
                
                if (takeProfit && stopLoss && entryPrice) {
                    setPriceProximityEmoji(getEmoji(lastPrice, takeProfit, stopLoss, entryPrice));
                } else {
                    setPriceProximityEmoji(null);
                }
            }
        }, 3000);

        return () => clearInterval(priceInterval);
    }, [takeProfit, stopLoss, entryPrice]);

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
        } else {
            setTpLine(null);
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
        } else {
            setSlLine(null);
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
        } else {
            setEntryLine(null);
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
                {marketSentiment && (
                    <div
                        className={cn(
                            "absolute top-2 left-2 z-10 rounded-md px-2 py-1 text-xs font-semibold text-primary-foreground",
                            marketSentiment === 'Bullish' ? 'bg-positive/80' : 'bg-negative/80'
                        )}
                    >
                        {marketSentiment}
                    </div>
                )}
                 {priceProximityEmoji && (
                    <div className="absolute top-2 right-2 z-10 text-2xl animate-pulse">
                        {priceProximityEmoji}
                    </div>
                 )}
                <div ref={chartContainerRef} className={cn("h-full w-full", loading && "opacity-0")} />
            </CardContent>
        </Card>
    );
}

    

    