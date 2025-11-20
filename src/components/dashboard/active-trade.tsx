"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPositions } from "@/lib/services/bybit-service";
import { Skeleton } from "../ui/skeleton";

type BtcPosition = {
    symbol: string;
    side: 'Buy' | 'Sell';
    size: string;
    avgPrice: string;
    unrealisedPnl: string;
    takeProfit?: string;
    stopLoss?: string;
} | undefined;

export function ActiveTrade() {
    const [btcPosition, setBtcPosition] = useState<BtcPosition>(undefined);
    const [loading, setLoading] = useState(true);

    const fetchBtcPosition = async () => {
        try {
            const positions = await getPositions();
            const position = positions.find((p: any) => p.symbol === 'BTCUSDT');
            setBtcPosition(position);
        } catch (error) {
            console.error("Failed to fetch active trade:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBtcPosition();
        const interval = setInterval(fetchBtcPosition, 5000);
        return () => clearInterval(interval);
    }, []);

  if (loading) {
    return <Skeleton className="h-40 lg:col-span-3" />;
  }

  if (!btcPosition) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle>Active BTCUSDT Trade</CardTitle>
            <CardDescription>Your current open position for Bitcoin.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground">No active BTCUSDT position.</p>
        </CardContent>
      </Card>
    );
  }

  const pnl = parseFloat(btcPosition.unrealisedPnl);
  const takeProfit = btcPosition.takeProfit ? parseFloat(btcPosition.takeProfit) : null;
  const stopLoss = btcPosition.stopLoss ? parseFloat(btcPosition.stopLoss) : null;

  return (
    <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle>Active BTCUSDT Trade</CardTitle>
            <CardDescription>Your current open position for Bitcoin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
            <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Side</p>
                <Badge variant={btcPosition.side === 'Buy' ? 'default' : 'destructive'} className={cn('w-fit', btcPosition.side === 'Buy' ? 'bg-positive/20 text-positive border-positive/30' : 'bg-negative/20 text-negative border-negative/30')}>
                    {btcPosition.side}
                </Badge>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Size</p>
                <p className="text-lg font-semibold">{btcPosition.size} BTC</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Entry Price</p>
                <p className="text-lg font-semibold">{parseFloat(btcPosition.avgPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
             <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Take Profit</p>
                <p className="text-lg font-semibold">{takeProfit ? takeProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</p>
            </div>
             <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Stop Loss</p>
                <p className="text-lg font-semibold">{stopLoss ? stopLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Unrealized PnL</p>
                <p className={cn("text-lg font-semibold", pnl >= 0 ? "text-positive" : "text-negative")}>{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
        </CardContent>
    </Card>
  );
}
