import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { marketData } from "@/lib/mock-data";
import {
  ChartContainer
} from "@/components/ui/chart";
import { BtcIcon, EthIcon, SolIcon } from "../icons/crypto";
import { cn } from "@/lib/utils";

const iconMap = {
    "BTC/USD": <BtcIcon className="w-6 h-6 text-yellow-500" />,
    "ETH/USD": <EthIcon className="w-6 h-6 text-gray-500" />,
    "SOL/USD": <SolIcon className="w-6 h-6 text-purple-500" />
}

export function MarketOverview() {
  return (
    <Card className="xl:col-span-1">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>
            Live prices for top cryptocurrencies.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="grid gap-4 pr-4">
            {marketData.map((market) => (
                <div key={market.symbol} className="grid grid-cols-3 items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        {iconMap[market.symbol as keyof typeof iconMap]}
                        <div>
                            <p className="text-sm font-medium">{market.symbol}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">${market.price.toLocaleString()}</p>
                        <p className={cn("text-xs", market.change >= 0 ? "text-positive" : "text-negative")}>
                            {market.change.toFixed(2)}%
                        </p>
                    </div>
                    <div className="h-12 w-full col-span-1">
                      {/* Sparkline chart removed to fix build error */}
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
