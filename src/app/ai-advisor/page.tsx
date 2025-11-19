import { AiChat } from '@/components/ai-advisor/ai-chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';
import { provideActionableInsights } from '@/ai/flows/ai-provide-actionable-insights';
import { totalPortfolioValue } from '@/lib/mock-data';

async function AdvisorInsights() {
  const insights = await provideActionableInsights({
    portfolioValue: totalPortfolioValue,
    marketConditions: 'Market is sideways, low volatility.',
    openPositions: 'Long BTC, Long ETH',
    riskPreference: 'normal'
  });

  if (!insights) {
    return <p>Could not load insights.</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-primary"/> Your Current Risk Level</CardTitle>
          <CardDescription>Based on your positions and market volatility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className="text-lg capitalize bg-yellow-100 text-yellow-800 border-yellow-300">
            {insights.marketMood}
          </Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/> Opportunities</CardTitle>
          <CardDescription>AI-identified potential opportunities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {insights.suggestedActions.filter(a => a.confidenceLevel !== 'low').map((opp, i) => (
                <p key={i} className="text-sm">{opp.action}</p>
            ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Warnings</CardTitle>
          <CardDescription>Potential risks to be aware of.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {insights.suggestedActions.filter(a => a.riskScore === 'high').map((risk, i) => (
                <p key={i} className="text-sm">{risk.action}: {risk.rationale}</p>
            ))}
            {insights.suggestedActions.filter(a => a.riskScore === 'high').length === 0 && <p className="text-sm text-muted-foreground">No high-risk warnings at the moment.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AiAdvisorPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <div className="grid auto-rows-max items-start gap-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Advisor</h1>
        <AdvisorInsights />
        <AiChat />
      </div>
    </div>
  );
}
