import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { assets } from "@/lib/mock-data";
import { AssetBreakdownChart } from "./asset-breakdown-chart";
import { ArrowUpRight } from "lucide-react";
import { getBalance } from "@/lib/services/bybit-service";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

async function PortfolioValue() {
    const totalPortfolioValue = await getBalance();
    const total24hChange = 2.15; // Placeholder
    return (
        <>
            <div className="text-4xl font-bold">
                {totalPortfolioValue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-positive font-medium">
                    <ArrowUpRight className="h-4 w-4" /> +{total24hChange}%
                </span>
                <span className="ml-1">in the last 24 hours</span>
            </div>
        </>
    )
}

export function TotalPortfolio() {
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>Total Portfolio</CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          Combined value across connected exchanges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-12 w-48" />}>
            <PortfolioValue />
        </Suspense>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="w-full">
            <AssetBreakdownChart data={assets} />
        </div>
      </CardFooter>
    </Card>
  );
}
