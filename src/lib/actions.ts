'use server';

import { aiAnswerTradingQuestions } from '@/ai/flows/ai-answer-trading-questions';
import { provideActionableInsights } from '@/ai/flows/ai-provide-actionable-insights';
import { summarizeMarketSignals } from '@/ai/flows/ai-summarize-market-signals';
import { getPositions } from './services/bybit-service';
import { totalPortfolioValue } from './mock-data';

export async function getActionableInsights() {
  try {
    const insights = await provideActionableInsights({
      portfolioValue: totalPortfolioValue,
      marketConditions: 'Market is volatile with BTC showing strength.',
      openPositions: 'Long BTC, Long ETH, Short SOL.',
      riskPreference: 'normal',
    });
    return insights;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function askAi(question: string) {
  if (!question) return { answer: 'Please provide a question.' };
  try {
    const positions = await getPositions();
    const positionContext = positions.length > 0
      ? `The user has the following open positions: ${positions.map(p => `${p.side} ${p.size} ${p.symbol} at an entry price of ${p.avgPrice}. The current unrealized PnL is ${p.unrealisedPnl}.`).join(', ')}.`
      : "The user currently has no open positions.";

    const fullQuestion = `${question} (User context: ${positionContext})`;
    
    const response = await aiAnswerTradingQuestions({ question: fullQuestion });
    return response;
  } catch (error) {
    console.error(error);
    return {
      answer: "Sorry, I couldn't process your question. Please try again.",
    };
  }
}

export async function getMarketSignalsSummary(
  momentumSignals: string,
  reversalSignals: string,
  breakoutSignals: string
) {
  try {
    const response = await summarizeMarketSignals({
      momentumSignals,
      reversalSignals,
      breakoutSignals,
      customRules: 'Focus on assets with high volume and clear trend.',
    });
    return response.summary;
  } catch (error) {
    console.error(error);
    return 'Could not retrieve AI summary.';
  }
}
