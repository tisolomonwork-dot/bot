import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActionableInsights } from "@/lib/actions";
import { Bot, ChevronRight, Zap } from "lucide-react";

export async function AiOpinionPanel() {
  const insights = await getActionableInsights();

  if (!insights) {
    return (
      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Opinion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Could not load AI insights.</p>
        </CardContent>
      </Card>
    );
  }

  const riskColorMap = {
    low: "bg-green-500/20 text-green-700 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    high: "bg-red-500/20 text-red-700 border-red-500/30",
  };

  return (
    <Card className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-background to-primary/5 shadow-primary/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="h-6 w-6" />
          AI Opinion
        </CardTitle>
        <CardDescription className="text-balance">
          {insights.marketMood && `Market mood is currently ${insights.marketMood}.`} Here are your top suggested actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {insights.suggestedActions.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary/80" />
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.rationale}</p>
                </div>
            </div>
            <Badge variant="outline" className={riskColorMap[item.riskScore.toLowerCase() as keyof typeof riskColorMap]}>
              {item.riskScore}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
