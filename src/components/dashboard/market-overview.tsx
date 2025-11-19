import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { marketData } from "@/lib/mock-data";
import { AreaChart, SparkLineChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, CartesianGrid, XAxis, YAxis } from "recharts";
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
                        <ChartContainer config={{}} className="w-full h-full">
                            <SparkLineChart
                                data={market.sparkline}
                                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                                className="h-full w-full"
                                accessibilityLayer
                            >
                                <defs>
                                    <linearGradient id={`fill-${market.symbol.split('/')[0]}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={market.change >= 0 ? "hsl(var(--positive))" : "hsl(var(--negative))"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={market.change >= 0 ? "hsl(var(--positive))" : "hsl(var(--negative))"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={market.change >= 0 ? "hsl(var(--positive))" : "hsl(var(--negative))"}
                                    fillOpacity={1}
                                    strokeWidth={2}
                                    fill={`url(#fill-${market.symbol.split('/')[0]})`}
                                />
                            </SparkLineChart>
                        </ChartContainer>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
