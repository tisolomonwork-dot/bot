import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { totalPortfolioValue, total24hChange, assets } from "@/lib/mock-data";
import { AssetBreakdownChart } from "./asset-breakdown-chart";
import { ArrowUpRight } from "lucide-react";

export function TotalPortfolio() {
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>Total Portfolio</CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          Combined value across Bybit and Gemini.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="w-full">
            <AssetBreakdownChart data={assets} />
        </div>
      </CardFooter>
    </Card>
  );
}
