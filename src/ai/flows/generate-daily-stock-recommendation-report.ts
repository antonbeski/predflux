'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a daily stock recommendation report.
 *
 * - generateDailyStockRecommendationReport - A function that generates the daily stock recommendation report.
 * - GenerateDailyStockRecommendationReportInput - The input type for the generateDailyStockRecommendationReport function.
 * - GenerateDailyStockRecommendationReportOutput - The return type for the generateDailyStockRecommendationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyStockRecommendationReportInputSchema = z.object({
  stockData: z.string().describe('Aggregated stock data including news and financial figures for NSE and BSE stocks.'),
});
export type GenerateDailyStockRecommendationReportInput = z.infer<typeof GenerateDailyStockRecommendationReportInputSchema>;

const StockRecommendationSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol.'),
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The AI recommendation for the stock.'),
  reason: z.string().describe('The reasoning behind the recommendation.'),
});

const GenerateDailyStockRecommendationReportOutputSchema = z.object({
  reportDate: z.string().describe('The date of the generated report in ISO format.'),
  recommendations: z.array(StockRecommendationSchema).describe('An array of stock recommendations.'),
});
export type GenerateDailyStockRecommendationReportOutput = z.infer<typeof GenerateDailyStockRecommendationReportOutputSchema>;

export async function generateDailyStockRecommendationReport(
  input: GenerateDailyStockRecommendationReportInput
): Promise<GenerateDailyStockRecommendationReportOutput> {
  return generateDailyStockRecommendationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyStockRecommendationReportPrompt',
  input: {schema: GenerateDailyStockRecommendationReportInputSchema},
  output: {schema: GenerateDailyStockRecommendationReportOutputSchema},
  prompt: `You are an AI assistant providing stock recommendations based on the provided financial data.

  Analyze the following stock data and provide a buy, sell, or hold recommendation for each stock.
  Explain the reasoning behind each recommendation.

  Stock Data: {{{stockData}}}

  Output should be structured as a JSON object with the following schema:
  {
    "reportDate": "YYYY-MM-DD",
    "recommendations": [
      {
        "ticker": "STOCK_TICKER",
        "recommendation": "Buy | Sell | Hold",
        "reason": "Explanation for the recommendation"
      },
      ...
    ]
  }

  Ensure that the reportDate is the current date in ISO format.
`,
});

const generateDailyStockRecommendationReportFlow = ai.defineFlow(
  {
    name: 'generateDailyStockRecommendationReportFlow',
    inputSchema: GenerateDailyStockRecommendationReportInputSchema,
    outputSchema: GenerateDailyStockRecommendationReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
