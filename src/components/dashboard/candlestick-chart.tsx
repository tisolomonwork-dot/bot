

"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi, type Time, type IPriceLine, LineStyle } from 'lightweight-charts';
import { getKlines, getTickers, getPositions } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

export function CandlestickChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const ma200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const retracementLinesRef = useRef<{ line50: IPriceLine | null, line618: IPriceLine | null }>({ line50: null, line618: null });
    const positionLinesRef = useRef<{ tp: IPriceLine | null, sl: IPriceLine | null, entry: IPriceLine | null }>({ tp: null, sl: null, entry: null });

    const [loading, setLoading] = useState(true);
    const [ticker, setTicker] = useState<{lastPrice: string, price24hPcnt: string} | null>(null);
    const [position, setPosition] = useState<any>(null);
    
    const [marketSentiment, setMarketSentiment] = useState<'Bullish' | 'Bearish' | null>(null);
    const [priceProximityEmoji, setPriceProximityEmoji] = useState<string | null>(null);

    const takeProfit = position?.takeProfit ? parseFloat(position.takeProfit) : undefined;
    const stopLoss = position?.stopLoss ? parseFloat(position.stopLoss) : undefined;
    const entryPrice = position?.avgPrice ? parseFloat(position.avgPrice) : undefined;

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

        const [klinesData, tickerData, positionsData] = await Promise.all([
            getKlines({
                category: 'linear',
                symbol: 'BTCUSDT',
                interval: '30',
                limit: 300,
            }),
            getTickers({ category: 'linear', symbol: 'BTCUSDT' }),
            getPositions(),
        ]);
        
        const btcPosition = positionsData.find(p => p.symbol === 'BTCUSDT');
        setPosition(btcPosition);

        if (klinesData && klinesData.length > 0) {
            const formattedData = klinesData.map(d => ({
                time: (new Date(d.date).getTime() / 1000) as Time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }));
            series.setData(formattedData);

            const ma200Data = calculateMA(formattedData, 200);
            maSeries.setData(ma200Data);

            const lastPrice = formattedData[formattedData.length - 1]?.close;
            const lastMa200 = ma200Data.filter(d => !isNaN(d.value)).pop()?.value;

            let currentSentiment: 'Bullish' | 'Bearish' | null = null;
            if (lastPrice && lastMa200) {
                currentSentiment = lastPrice > lastMa200 ? 'Bullish' : 'Bearish';
                setMarketSentiment(currentSentiment);
            } else {
                setMarketSentiment(null);
            }

            const recentLow = Math.min(...formattedData.slice(-50).map(d => d.low));
            const recentHigh = Math.max(...formattedData.slice(-50).map(d => d.high));
            const range = recentHigh - recentLow;
            
            let level50, level618;

            if (currentSentiment === 'Bullish') { // Above 200MA, pullback from high
                level50 = recentHigh - (range * 0.5);
                level618 = recentHigh - (range * 0.618);
            } else { // Bearish, below 200MA, rally from low
                level50 = recentLow + (range * 0.5);
                level618 = recentLow + (range * 0.618);
            }
            
            if (retracementLinesRef.current.line50) series.removePriceLine(retracementLinesRef.current.line50);
            retracementLinesRef.current.line50 = series.createPriceLine({
                price: level50,
                color: 'rgba(255, 193, 7, 0.5)',
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: '50%',
            });
            
            if (retracementLinesRef.current.line618) series.removePriceLine(retracementLinesRef.current.line618);
            retracementLinesRef.current.line618 = series.createPriceLine({
                price: level618,
                color: 'rgba(3, 169, 244, 0.5)',
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: '61.8%',
            });

            chartApiRef.current?.timeScale().fitContent();
        }

        if (tickerData.length > 0) {
            setTicker(tickerData[0]);
        }
        
        if(loading){
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 420,
            layout: {
                background: { color: 'transparent' },
                textColor: 'rgba(138, 144, 153, 1)',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 1)' },
                horzLines: { color: 'rgba(42, 46, 57, 1)' },
            },
            timeScale: {
                borderColor: 'rgba(42, 46, 57, 1)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 1)',
            },
        });

        const series = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        const getEmoji = (price: number, tp: number, sl: number) => {
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
                
                if (takeProfit && stopLoss) {
                    setPriceProximityEmoji(getEmoji(lastPrice, takeProfit, stopLoss));
                } else {
                    setPriceProximityEmoji(null);
                }
            }
        }, 3000);

        return () => clearInterval(priceInterval);
    }, [takeProfit, stopLoss]);

    // Update TP/SL/Entry lines
    useEffect(() => {
        const series = candlestickSeriesRef.current;
        if (!series) return;
    
        // Clear existing lines first
        if (positionLinesRef.current.tp) {
            series.removePriceLine(positionLinesRef.current.tp);
            positionLinesRef.current.tp = null;
        }
        if (positionLinesRef.current.sl) {
            series.removePriceLine(positionLinesRef.current.sl);
            positionLinesRef.current.sl = null;
        }
        if (positionLinesRef.current.entry) {
            series.removePriceLine(positionLinesRef.current.entry);
            positionLinesRef.current.entry = null;
        }
        
        // Draw new lines
        if (takeProfit) {
            positionLinesRef.current.tp = series.createPriceLine({
                price: takeProfit,
                color: '#22c55e',
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'TP',
            });
        }
        if (stopLoss) {
            positionLinesRef.current.sl = series.createPriceLine({
                price: stopLoss,
                color: '#ef4444',
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'SL',
            });
        }
        if (entryPrice) {
            positionLinesRef.current.entry = series.createPriceLine({
                price: entryPrice,
                color: '#fafafa',
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: 'Entry',
            });
        }
    }, [takeProfit, stopLoss, entryPrice]);
    

    const priceChangePercent = ticker ? parseFloat(ticker.price24hPcnt) * 100 : 0;

    return (
        <Card className="h-full">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-baseline gap-4">
                    <CardTitle>BTC/USD</CardTitle>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-medium">
                            {ticker ? parseFloat(ticker.lastPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : <Skeleton className="h-7 w-24" />}
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
