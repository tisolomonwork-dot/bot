"use server";

import { aiAnswerTradingQuestions } from "@/ai/flows/ai-answer-trading-questions";
import { provideActionableInsights } from "@/ai/flows/ai-provide-actionable-insights";
import { summarizeMarketSignals } from "@/ai/flows/ai-summarize-market-signals";
import { totalPortfolioValue } from "./mock-data";

export async function getActionableInsights() {
  try {
    const insights = await provideActionableInsights({
      portfolioValue: totalPortfolioValue,
      marketConditions: "Market is volatile with BTC showing strength.",
      openPositions: "Long BTC, Long ETH, Short SOL.",
      riskPreference: "normal",
    });
    return insights;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function askAi(question: string) {
    if (!question) return { answer: "Please provide a question." };
    try {
        const response = await aiAnswerTradingQuestions({ question });
        return response;
    } catch (error) {
        console.error(error);
        return { answer: "Sorry, I couldn't process your question. Please try again." };
    }
}

export async function getMarketSignalsSummary(momentumSignals: string, reversalSignals: string, breakoutSignals: string) {
    try {
        const response = await summarizeMarketSignals({
            momentumSignals,
            reversalSignals,
            breakoutSignals,
            customRules: "Focus on assets with high volume and clear trend.",
        });
        return response.summary;
    } catch (error) {
        console.error(error);
        return "Could not retrieve AI summary.";
    }
}
