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
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Promise.all will fail if one promise rejects.
      // We want to attempt both and handle partial success.
      const balanceData = await getBalance();
      const positionsData = await getPositions();
      
      // getBalance returns 0 on error, which is a valid state
      setBalance(balanceData);
      
      // getPositions returns [] on error, which is a valid state
      const pnl = positionsData.reduce((acc, pos) => acc + parseFloat(pos.unrealisedPnl || '0'), 0);
      setTotalPnl(pnl);

    } catch (error) {
      console.error("Failed to fetch balance and PnL:", error);
      setError("Could not load data.");
      setBalance(0);
      setTotalPnl(0);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <>
        <Skeleton className="h-[76px] rounded-lg" />
        <Skeleton className="h-[76px] rounded-lg" />
      </>
    );
  }

  if (error) {
    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-normal text-muted-foreground">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">{error}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-normal text-muted-foreground">Unrealized P&L</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-destructive">{error}</p>
                </CardContent>
            </Card>
        </>
    )
  }

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-normal text-muted-foreground">Total Balance</CardTitle>
                 <span className="text-xs text-muted-foreground">USD</span>
            </CardHeader>
            <CardContent>
                <div className="text-lg font-normal">
                    {balance !== null ? balance.toLocaleString("en-US", { style: "currency", currency: "USD" }) : <CircleDashed className="h-5 w-5 animate-spin" />}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-normal text-muted-foreground">Unrealized P&L</CardTitle>
                {totalPnl === null ? <CircleDashed className="h-4 w-4 animate-spin" /> : totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-positive" /> : <TrendingDown className="h-4 w-4 text-negative" />}
            </CardHeader>
            <CardContent>
                <div className={cn("text-lg font-normal", totalPnl === null ? "" : totalPnl >= 0 ? "text-positive" : "text-negative")}>
                    {totalPnl !== null ? totalPnl.toLocaleString("en-US", { style: "currency", currency: "USD" }) : <CircleDashed className="h-5 w-5 animate-spin" />}
                </div>
            </CardContent>
        </Card>
    </>
  );
}
