'use server';

/**
 * @fileOverview Provides concise summaries of current market conditions, potential opportunities, and risks.
 *
 * - summarizeMarketConditions - A function that returns a summary of the current market conditions.
 * - SummarizeMarketConditionsInput - The input type for the summarizeMarketConditions function.
 * - SummarizeMarketConditionsOutput - The return type for the summarizeMarketConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketConditionsInputSchema = z.object({
  marketData: z
    .string()
    .describe('Real-time market data from Bybit and Gemini.'),
  portfolioData: z
    .string()
    .describe('User portfolio data including positions and open orders.'),
  riskPreference: z
    .string()
    .optional()
    .describe('User risk preference: conservative, normal, or aggressive.'),
});
export type SummarizeMarketConditionsInput =
  z.infer<typeof SummarizeMarketConditionsInputSchema>;

const SummarizeMarketConditionsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the current market conditions.'),
  opportunities: z.string().describe('Potential market opportunities.'),
  risks: z.string().describe('Potential risks in the market.'),
  suggestedActions: z
    .string()
    .describe('Prioritized, suggested actions for the user.'),
  riskScore: z.string().describe('An overall risk score for the user.'),
  confidenceMeter: z
    .string()
    .describe('A confidence meter indicating the AI confidence.'),
});
export type SummarizeMarketConditionsOutput =
  z.infer<typeof SummarizeMarketConditionsOutputSchema>;

export async function summarizeMarketConditions(
  input: SummarizeMarketConditionsInput
): Promise<SummarizeMarketConditionsOutput> {
  return summarizeMarketConditionsFlow(input);
}

const summarizeMarketConditionsPrompt = ai.definePrompt({
  name: 'summarizeMarketConditionsPrompt',
  input: {schema: SummarizeMarketConditionsInputSchema},
  output: {schema: SummarizeMarketConditionsOutputSchema},
  prompt: `You are an AI assistant providing summaries of current market conditions, potential opportunities, and risks to the user.

  Analyze the provided market data and user portfolio data to provide the user with actionable insights and recommendations. Consider the risk preference of the user and tailor the response accordingly.

  Market Data: {{{marketData}}}
  Portfolio Data: {{{portfolioData}}}
  Risk Preference: {{{riskPreference}}}

  Summary: Provide a concise summary of the current market conditions.
  Opportunities: Highlight any potential market opportunities based on the market data and portfolio.
  Risks: Highlight any potential risks based on the market data and portfolio.
  Suggested Actions: Suggest prioritized actions for the user based on opportunities and risks.
  Risk Score: Provide an overall risk score for the user (Green/Yellow/Red).
  Confidence Meter: Indicate your confidence in the analysis (Low/Medium/High).`,
});

const summarizeMarketConditionsFlow = ai.defineFlow(
  {
    name: 'summarizeMarketConditionsFlow',
    inputSchema: SummarizeMarketConditionsInputSchema,
    outputSchema: SummarizeMarketConditionsOutputSchema,
  },
  async input => {
    const {output} = await summarizeMarketConditionsPrompt(input);
    return output!;
  }
);
