'use server';

/**
 * @fileOverview Provides prioritized, suggested actions for the user's portfolio with associated risk scores and confidence levels.
 *
 * - provideActionableInsights - A function that provides actionable insights for trading strategies.
 * - ActionableInsightsInput - The input type for the provideActionableInsights function.
 * - ActionableInsightsOutput - The return type for the provideActionableInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionableInsightsInputSchema = z.object({
  portfolioValue: z.number().describe('The current total value of the portfolio.'),
  marketConditions: z.string().describe('A summary of the current market conditions.'),
  openPositions: z.string().describe('A summary of the user\'s open positions.'),
  riskPreference: z
    .enum(['conservative', 'normal', 'aggressive'])
    .describe('The risk preference of the user.'),
});
export type ActionableInsightsInput = z.infer<typeof ActionableInsightsInputSchema>;

const ActionableInsightsOutputSchema = z.object({
  suggestedActions: z.array(
    z.object({
      action: z.string().describe('The suggested action to take.'),
      riskScore: z.string().describe('The risk score associated with the action (low, medium, high).'),
      confidenceLevel: z
        .string()
        .describe('The confidence level in the suggested action (low, medium, high).'),
      rationale: z.string().describe('The rationale behind the suggested action.'),
    })
  ).describe('A list of suggested actions with risk scores and confidence levels.'),
  marketMood: z.string().describe('A general assessment of the market mood (bearish, bullish, neutral)'),
});
export type ActionableInsightsOutput = z.infer<typeof ActionableInsightsOutputSchema>;

export async function provideActionableInsights(
  input: ActionableInsightsInput
): Promise<ActionableInsightsOutput> {
  return actionableInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'actionableInsightsPrompt',
  input: {schema: ActionableInsightsInputSchema},
  output: {schema: ActionableInsightsOutputSchema},
  prompt: `You are an AI trading advisor providing actionable insights for a user's portfolio.

  The user has a portfolio value of {{{portfolioValue}}}.
  The current market conditions are: {{{marketConditions}}}.
  The user's open positions are: {{{openPositions}}}.
  The user's risk preference is: {{{riskPreference}}}.

  Based on this information, provide a list of suggested actions, each with a risk score (low, medium, high), a confidence level (low, medium, high), and a rationale.
  Also provide the overall market mood.

  Format your output as a JSON object conforming to the ActionableInsightsOutputSchema.

  Here's an example of the output format:
  {
    "suggestedActions": [
      {
        "action": "Reduce BTC position",
        "riskScore": "medium",
        "confidenceLevel": "high",
        "rationale": "BTC is overbought and showing signs of a reversal."
      },
      {
        "action": "Monitor ETH breakout",
        "riskScore": "low",
        "confidenceLevel": "medium",
        "rationale": "ETH is consolidating and may break out soon."
      }
    ],
    "marketMood": "bearish"
  }
  `,
});

const actionableInsightsFlow = ai.defineFlow(
  {
    name: 'actionableInsightsFlow',
    inputSchema: ActionableInsightsInputSchema,
    outputSchema: ActionableInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
