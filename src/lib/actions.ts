'use server';

import { aiAnswerTradingQuestions } from '@/ai/flows/ai-answer-trading-questions';
import { provideActionableInsights } from '@/ai/flows/ai-provide-actionable-insights';
import { summarizeMarketSignals } from '@/ai/flows/ai-summarize-market-signals';
// We use the client-side services now, which call our internal API routes.
import { getBalance, getPositions, getOpenOrders as getBybitOpenOrdersService, placeOrder as placeBybitOrderService } from './services/bybit-service';


export async function getBybitBalance() {
  // Directly calling the client-side service is fine here as it's just a fetch call
  return getBalance();
}

export async function getBybitPositions() {
  return getPositions();
}

export async function getBybitOpenOrders() {
    return getBybitOpenOrdersService();
}


export async function getActionableInsights() {
  try {
    // These functions now call our internal Next.js API routes
    const [balance, positions] = await Promise.all([
      getBalance(),
      getPositions(),
    ]);

    const positionContext = positions.length > 0
      ? `The user has the following open positions: ${positions.map((p: any) => {
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
      marketConditions: 'Market is volatile with BTC showing strength. Analyze the provided positions to determine overall market sentiment.',
      openPositions: positionContext,
      riskPreference: 'normal', 
    });
    return insights;
  } catch (error) {
    console.error("Error in getActionableInsights:", error);
    return null;
  }
}

export async function askAi(question: string) {
  if (!question) return { answer: 'Please provide a question.' };
  try {
    const [positions, balance] = await Promise.all([
      getPositions(),
      getBalance(),
    ]);

    const positionContext = positions.length > 0
      ? `The user has the following open positions: ${positions.map((p: any) => {
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
    
    const riskPreference = 'normal';
    const marketSummary = 'Market is currently volatile with a slight bullish bias on BTC.';
    
    const fullContextQuestion = `A user with a portfolio balance of $${balance.toLocaleString()} and a '${riskPreference}' risk tolerance is asking a question.
    
    Current Market Summary: ${marketSummary}
    User's Open Positions: ${positionContext}

    User's Question: "${question}"
    `;
    
    const response = await aiAnswerTradingQuestions({ question: fullContextQuestion });
    return response;
  } catch (error) {
    console.error("Error in askAi:", error);
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
