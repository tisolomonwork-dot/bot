import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exchangePortfolios } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ExchangeSplit() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      {exchangePortfolios.map((portfolio) => (
        <Card key={portfolio.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{portfolio.name} Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio.totalValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolio.assetCount} assets
            </p>
            <p className={cn("text-xs font-semibold", portfolio.pnl >= 0 ? "text-positive" : "text-negative")}>
                {portfolio.pnl >= 0 ? '+' : ''}{portfolio.pnl.toLocaleString("en-US", { style: "currency", currency: "USD" })} PNL
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
