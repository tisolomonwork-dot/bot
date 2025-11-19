'use server';
/**
 * @fileOverview Summarizes market signals from momentum, reversal, and breakout scanners based on custom user-defined rules.
 *
 * - summarizeMarketSignals - A function that summarizes market signals.
 * - SummarizeMarketSignalsInput - The input type for the summarizeMarketSignals function.
 * - SummarizeMarketSignalsOutput - The return type for the summarizeMarketSignals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketSignalsInputSchema = z.object({
  momentumSignals: z.string().describe('Momentum scanner signals.'),
  reversalSignals: z.string().describe('Reversal scanner signals.'),
  breakoutSignals: z.string().describe('Breakout scanner signals.'),
  customRules: z.string().describe('Custom user-defined rules for signal filtering.'),
});
export type SummarizeMarketSignalsInput = z.infer<typeof SummarizeMarketSignalsInputSchema>;

const SummarizeMarketSignalsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of relevant trading opportunities based on the provided signals and rules.'),
});
export type SummarizeMarketSignalsOutput = z.infer<typeof SummarizeMarketSignalsOutputSchema>;

export async function summarizeMarketSignals(input: SummarizeMarketSignalsInput): Promise<SummarizeMarketSignalsOutput> {
  return summarizeMarketSignalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMarketSignalsPrompt',
  input: {schema: SummarizeMarketSignalsInputSchema},
  output: {schema: SummarizeMarketSignalsOutputSchema},
  prompt: `You are an AI trading assistant. Your role is to summarize trading signals based on momentum, reversal, and breakout scanners, taking into account custom user-defined rules.

Momentum Signals: {{{momentumSignals}}}
Reversal Signals: {{{reversalSignals}}}
Breakout Signals: {{{breakoutSignals}}}
Custom Rules: {{{customRules}}}

Provide a concise summary of the most relevant trading opportunities, considering the signals and rules provided. Focus on actionable insights and potential risks.`, 
});

const summarizeMarketSignalsFlow = ai.defineFlow(
  {
    name: 'summarizeMarketSignalsFlow',
    inputSchema: SummarizeMarketSignalsInputSchema,
    outputSchema: SummarizeMarketSignalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
