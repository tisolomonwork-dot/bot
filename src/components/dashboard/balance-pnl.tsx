"use client";

import { useState, useEffect } from "react";
import { getBalance, getPositions } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, CircleDashed } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function BalancePnl() {
  const [balance, setBalance] = useState<number | null>(null);
  const [totalPnl, setTotalPnl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [balanceData, positionsData] = await Promise.all([getBalance(), getPositions()]);
      const pnl = positionsData.reduce((acc, pos) => acc + parseFloat(pos.unrealisedPnl || '0'), 0);
      setBalance(balanceData);
      setTotalPnl(pnl);
    } catch (error) {
      console.error("Failed to fetch balance and PnL:", error);
    } finally {
        if (loading) {
            setLoading(false);
        }
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (loading) {
    return (
      <>
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </>
    );
  }

  return (
    <>
        <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                 <span className="text-muted-foreground">USD</span>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">
                    {balance !== null ? balance.toLocaleString("en-US", { style: "currency", currency: "USD" }) : <CircleDashed className="h-8 w-8 animate-spin" />}
                </div>
            </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&amp;L</CardTitle>
                {totalPnl === null ? <CircleDashed className="h-4 w-4 animate-spin" /> : totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-positive" /> : <TrendingDown className="h-4 w-4 text-negative" />}
            </CardHeader>
            <CardContent>
                <div className={cn("text-3xl font-bold", totalPnl === null ? "" : totalPnl >= 0 ? "text-positive" : "text-negative")}>
                    {totalPnl !== null ? totalPnl.toLocaleString("en-US", { style: "currency", currency: "USD" }) : <CircleDashed className="h-8 w-8 animate-spin" />}
                </div>
            </CardContent>
        </Card>
    </>
  );
}
