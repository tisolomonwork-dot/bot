'use client';

import { useState, useEffect } from 'react';
import { Bot, Zap, CircleDashed } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getActionableInsights } from '@/lib/actions';
import type { ActionableInsightsOutput } from '@/ai/flows/ai-provide-actionable-insights';
import { Skeleton } from '../ui/skeleton';

const riskColorMap = {
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  medium: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  high: "bg-gray-500/20 text-gray-200 border-gray-500/30",
};


export function AiOpinionCard() {
  const [insights, setInsights] = useState<ActionableInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getActionableInsights();
      if (result) {
        setInsights(result);
        setLastUpdated(new Date());
      } else {
        // The action returns null on API failure now
        setError("AI insights are currently unavailable.");
        setInsights(null);
      }
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
      setError("Could not load AI insights at the moment.");
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(); // Initial fetch
    const interval = setInterval(fetchInsights, 30 * 60 * 1000); // Fetch every 30 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading && !insights) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
        <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-card-foreground" />
            A.I. Opinion
            </CardTitle>
            {loading && <CircleDashed className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {insights && (
            <CardDescription className="text-balance">
                {insights.marketMood && `Market mood is currently ${insights.marketMood}.`} Here are your top suggested actions.
                {lastUpdated && <span className="block text-xs mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</span>}
            </CardDescription>
        )}
        </CardHeader>
        <CardContent className="grid gap-3">
            {error && <p className="text-destructive text-center p-4 text-sm">{error}</p>}
            {insights?.suggestedActions.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                        <p className="text-xs font-normal">{item.action}</p>
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
