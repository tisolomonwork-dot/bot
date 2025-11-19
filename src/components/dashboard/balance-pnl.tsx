import { getBalance, getPositions } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export async function BalancePnl() {
  const balance = await getBalance();
  const positions = await getPositions();
  const totalPnl = positions.reduce((acc, pos) => acc + parseFloat(pos.unrealisedPnl || '0'), 0);

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", totalPnl >= 0 ? "text-positive" : "text-negative")}>
                    {totalPnl.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </div>
            </CardContent>
        </Card>
    </>
  );
}
