'use server';

import { aiAnswerTradingQuestions } from '@/ai/flows/ai-answer-trading-questions';
import { provideActionableInsights } from '@/ai/flows/ai-provide-actionable-insights';
import { summarizeMarketSignals } from '@/ai/flows/ai-summarize-market-signals';
import { getBalance, getPositions } from './services/bybit-service';

export async function getActionableInsights() {
  try {
    const [balance, positions] = await Promise.all([
      getBalance(),
      getPositions(),
    ]);

    const positionContext = positions.length > 0
      ? `The user has the following open positions: ${positions.map(p => {
          let positionString = `${p.side} ${p.size} ${p.symbol} at an entry price of ${p.avgPrice}. The current unrealized PnL is ${p.unrealisedPnl}.`;
          if (p.takeProfit) {
            positionString += ` Take Profit is set to ${p.takeProfit}.`;
          }
          if (p.stopLoss) {
            positionString += ` Stop Loss is set to ${p.stopLoss}.`;
          }
          return positionString;
        }).join('; ')}.`
      : "The user currently has no open positions.";

    const insights = await provideActionableInsights({
      portfolioValue: balance,
      marketConditions: 'Market is volatile with BTC showing strength. Analyze the provided positions to determine overall market sentiment.', // The AI can infer more from the live data.
      openPositions: positionContext,
      riskPreference: 'normal', // This can be updated later to pull from user settings.
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
    // --- Enhanced Context Gathering ---
    const [positions, balance] = await Promise.all([
      getPositions(),
      getBalance(),
    ]);

    const positionContext = positions.length > 0
      ? `The user has the following open positions: ${positions.map(p => {
          let positionString = `${p.side} ${p.size} ${p.symbol} at an entry price of ${p.avgPrice}. The current unrealized PnL is ${p.unrealisedPnl}.`;
          if (p.takeProfit) {
            positionString += ` Take Profit is set to ${p.takeProfit}.`;
          }
          if (p.stopLoss) {
            positionString += ` Stop Loss is set to ${p.stopLoss}.`;
          }
          return positionString;
        }).join('; ')}.`
      : "The user currently has no open positions.";

    // For now, we'll use a mock risk preference and market summary. This could be stored in user settings.
    const riskPreference = 'normal';
    const marketSummary = 'Market is currently volatile with a slight bullish bias on BTC.';
    
    const fullContextQuestion = `A user with a portfolio balance of $${balance.toLocaleString()} and a '${riskPreference}' risk tolerance is asking a question.
    
    Current Market Summary: ${marketSummary}
    User's Open Positions: ${positionContext}

    User's Question: "${question}"
    `;
    // --- End Enhanced Context ---
    
    const response = await aiAnswerTradingQuestions({ question: fullContextQuestion });
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
