import { getBalance, getPositions } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export async function BalancePnl() {
  const balance = await getBalance();
  const positions = await getPositions();
  const totalPnl = positions.reduce((acc, pos) => acc + parseFloat(pos.unrealisedPnl || '0'), 0);

  return (
    <>
        <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                 <span className="text-muted-foreground">USD</span>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">
                    {balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </div>
            </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-sm bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&L</CardTitle>
                {totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-positive" /> : <TrendingDown className="h-4 w-4 text-negative" />}
            </CardHeader>
            <CardContent>
                <div className={cn("text-3xl font-bold", totalPnl >= 0 ? "text-positive" : "text-negative")}>
                    {totalPnl.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </div>
            </CardContent>
        </Card>
    </>
  );
}
