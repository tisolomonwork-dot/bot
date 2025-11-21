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
    return (
        <div className="flex h-9 w-full items-center justify-end rounded-lg border border-dashed bg-card pl-8 pr-4 font-mono text-sm font-medium tabular-nums shadow-sm">
            {totalPortfolioValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            })}
        </div>
    )
}

export function TotalPortfolio() {
  // This component now relies on mock data for the chart and fetches balance via the service.
  // The service has been updated to call the internal Next.js API route.
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>Total Portfolio</CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          Combined value across connected exchanges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-9 w-32" />}>
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
