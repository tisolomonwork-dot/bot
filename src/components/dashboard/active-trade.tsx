import { getPositions } from "@/lib/services/bybit-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export async function ActiveTrade() {
  const positions = await getPositions();
  const btcPosition = positions.find(p => p.symbol === 'BTCUSDT');

  if (!btcPosition) {
    return (
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Active BTCUSDT Trade</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No active BTCUSDT position.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const pnl = parseFloat(btcPosition.unrealisedPnl);

  return (
    <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Active BTCUSDT Trade</CardTitle>
                <CardDescription>Your current open position for Bitcoin.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Side</p>
                    <Badge variant={btcPosition.side === 'Buy' ? 'default' : 'destructive'} className={cn(btcPosition.side === 'Buy' ? 'bg-positive hover:bg-positive/80' : 'bg-negative hover:bg-negative/80')}>
                        {btcPosition.side}
                    </Badge>
                </div>
                <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-semibold">{btcPosition.size} BTC</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Entry Price</p>
                    <p className="font-semibold">{parseFloat(btcPosition.avgPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Unrealized PnL</p>
                    <p className={cn("font-semibold", pnl >= 0 ? "text-positive" : "text-negative")}>{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
