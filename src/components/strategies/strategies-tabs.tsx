import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMarketSignalsSummary } from "@/lib/actions";
import { Bot } from "lucide-react";

async function AiSummary({ scannerType, signals }: { scannerType: string; signals: string }) {
  const summary = await getMarketSignalsSummary(
    scannerType === 'momentum' ? signals : '',
    scannerType === 'reversal' ? signals : '',
    scannerType === 'breakout' ? signals : ''
  );

  return (
    <div className="mt-4 rounded-lg bg-primary/5 p-4 border border-primary/10">
      <h4 className="flex items-center gap-2 font-semibold text-primary">
        <Bot className="h-5 w-5" />
        AI Summary
      </h4>
      <p className="text-sm text-foreground/80 mt-2">{summary}</p>
    </div>
  );
}

export function StrategiesTabs() {
  const momentumSignals = "BTC, ETH showing strong upward momentum. SOL is weak.";
  const reversalSignals = "Possible top for DOGE. ADA is showing signs of bottoming.";
  const breakoutSignals = "ETH is consolidating near resistance. LINK is close to a major breakout level.";

  return (
    <Tabs defaultValue="momentum" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="momentum">Momentum</TabsTrigger>
        <TabsTrigger value="reversal">Reversal</TabsTrigger>
        <TabsTrigger value="breakout">Breakout</TabsTrigger>
      </TabsList>
      <TabsContent value="momentum">
        <Card>
          <CardHeader>
            <CardTitle>Momentum Scanner</CardTitle>
            <CardDescription>
              Assets with strong price movement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{momentumSignals}</p>
            <AiSummary scannerType="momentum" signals={momentumSignals} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reversal">
        <Card>
          <CardHeader>
            <CardTitle>Reversal Watch</CardTitle>
            <CardDescription>
              Assets potentially changing direction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{reversalSignals}</p>
            <AiSummary scannerType="reversal" signals={reversalSignals} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="breakout">
        <Card>
          <CardHeader>
            <CardTitle>Breakout Alerts</CardTitle>
            <CardDescription>
              Assets nearing significant price levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{breakoutSignals}</p>
            <AiSummary scannerType="breakout" signals={breakoutSignals} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
