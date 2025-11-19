'use server';
/**
 * @fileOverview An AI agent that answers trading-related questions.
 *
 * - aiAnswerTradingQuestions - A function that handles answering trading questions.
 * - AiAnswerTradingQuestionsInput - The input type for the aiAnswerTradingQuestions function.
 * - AiAnswerTradingQuestionsOutput - The return type for the aiAnswerTradingQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAnswerTradingQuestionsInputSchema = z.object({
  question: z.string().describe('The trading-related question to be answered.'),
});
export type AiAnswerTradingQuestionsInput = z.infer<typeof AiAnswerTradingQuestionsInputSchema>;

const AiAnswerTradingQuestionsOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AiAnswerTradingQuestionsOutput = z.infer<typeof AiAnswerTradingQuestionsOutputSchema>;

export async function aiAnswerTradingQuestions(input: AiAnswerTradingQuestionsInput): Promise<AiAnswerTradingQuestionsOutput> {
  return aiAnswerTradingQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAnswerTradingQuestionsPrompt',
  input: {schema: AiAnswerTradingQuestionsInputSchema},
  output: {schema: AiAnswerTradingQuestionsOutputSchema},
  prompt: `You are an AI trading assistant that answers user questions regarding market trends, portfolio adjustments, and strategy evaluations.
  Answer the following question:
  {{question}}`,
});

const aiAnswerTradingQuestionsFlow = ai.defineFlow(
  {
    name: 'aiAnswerTradingQuestionsFlow',
    inputSchema: AiAnswerTradingQuestionsInputSchema,
    outputSchema: AiAnswerTradingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
