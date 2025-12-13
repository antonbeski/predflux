// This is a server-side file!
'use server';

/**
 * @fileOverview Analyzes stock data using GenAI to provide buy/sell/hold recommendations.
 *
 * - analyzeStockDataAndGenerateRecommendations -  Analyzes stock data and provides recommendations.
 * - AnalyzeStockDataAndGenerateRecommendationsInput - The input type for the analyzeStockDataAndGenerateRecommendations function.
 * - AnalyzeStockDataAndGenerateRecommendationsOutput - The return type for the analyzeStockDataAndGenerateRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStockDataAndGenerateRecommendationsInputSchema = z.object({
  stockTicker: z.string().describe('The ticker symbol of the stock to analyze (e.g., AAPL).'),
  newsData: z.string().describe('News headlines and summaries related to the stock.'),
  financialData: z.string().describe('Financial data for the stock, including price, volume, etc.'),
});

export type AnalyzeStockDataAndGenerateRecommendationsInput =
  z.infer<typeof AnalyzeStockDataAndGenerateRecommendationsInputSchema>;

const AnalyzeStockDataAndGenerateRecommendationsOutputSchema = z.object({
  recommendation: z
    .enum(['buy', 'sell', 'hold'])
    .describe('The AI recommendation for the stock (buy, sell, or hold).'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the recommendation, based on the provided data.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A confidence score (0 to 1) indicating the AI confidence in the recommendation.'),
});

export type AnalyzeStockDataAndGenerateRecommendationsOutput =
  z.infer<typeof AnalyzeStockDataAndGenerateRecommendationsOutputSchema>;

export async function analyzeStockDataAndGenerateRecommendations(
  input: AnalyzeStockDataAndGenerateRecommendationsInput
): Promise<AnalyzeStockDataAndGenerateRecommendationsOutput> {
  return analyzeStockDataAndGenerateRecommendationsFlow(input);
}

const analyzeStockDataAndGenerateRecommendationsPrompt = ai.definePrompt({
  name: 'analyzeStockDataAndGenerateRecommendationsPrompt',
  input: {schema: AnalyzeStockDataAndGenerateRecommendationsInputSchema},
  output: {schema: AnalyzeStockDataAndGenerateRecommendationsOutputSchema},
  prompt: `You are an AI stock analyst providing investment recommendations.

  Analyze the provided news and financial data for the given stock and provide a buy, sell, or hold recommendation.
  Include your reasoning for the recommendation and a confidence score.

  Stock Ticker: {{{stockTicker}}}
  News Data: {{{newsData}}}
  Financial Data: {{{financialData}}}
  
  Important:
  - The reasoning should be based STRICTLY on the News Data and Financial Data provided. DO NOT use external knowledge.
  - The confidenceScore must be between 0 and 1. Where 1 represents complete confidence and 0 represents no confidence.
  - The recommendation is very important. Make sure the reasoning matches the recommendation.
  `,
});

const analyzeStockDataAndGenerateRecommendationsFlow = ai.defineFlow(
  {
    name: 'analyzeStockDataAndGenerateRecommendationsFlow',
    inputSchema: AnalyzeStockDataAndGenerateRecommendationsInputSchema,
    outputSchema: AnalyzeStockDataAndGenerateRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await analyzeStockDataAndGenerateRecommendationsPrompt(input);
    return output!;
  }
);
