// This is a server-side file!
'use server';

/**
 * @fileOverview A Genkit flow to search for stocks based on a user query.
 *
 * - searchStocks - A function that searches for stocks.
 * - SearchStocksInput - The input type for the searchStocks function.
 * - SearchStocksOutput - The return type for the searchStocks function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchStocksInputSchema = z.object({
  query: z.string().describe("The user's search query for stocks (e.g., 'Apple', 'MSFT', 'reliance industries')."),
});
export type SearchStocksInput = z.infer<typeof SearchStocksInputSchema>;

const SearchedStockSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol identified from the query.'),
  name: z.string().describe('The company name identified from the query.'),
  reason: z.string().describe('A brief explanation of what was identified.'),
});

const SearchStocksOutputSchema = z.object({
  results: z
    .array(SearchedStockSchema)
    .describe('An array of stock results matching the query. If a ticker is identified, return it.'),
});
export type SearchStocksOutput = z.infer<typeof SearchStocksOutputSchema>;

export async function searchStocks(input: SearchStocksInput): Promise<SearchStocksOutput> {
  return searchStocksFlow(input);
}

const searchStocksPrompt = ai.definePrompt({
  name: 'searchStocksPrompt',
  input: { schema: SearchStocksInputSchema },
  output: { schema: SearchStocksOutputSchema },
  prompt: `You are an AI assistant for a stock trading app. Your task is to identify potential stock tickers and company names from a user's search query.

User query: "{{query}}"

Your task:
1.  Analyze the user's query to identify a plausible stock ticker symbol or a company name.
2.  The ticker symbol is the most important piece of information. If the query looks like a ticker (e.g., 'AAPL', 'MSFT', 'RELIANCE'), extract it.
3.  If the query is a company name (e.g., 'Apple', 'Microsoft', 'Reliance Industries'), provide the most likely ticker symbol for it on a major exchange (like NASDAQ for US stocks, or NSE/BSE for Indian stocks).
4.  Return a single result containing the identified ticker and company name.
5.  For the 'reason' field, briefly state what you identified (e.g., "Identified 'AAPL' as a ticker." or "Identified 'Microsoft' as a company.").

Example 1:
User query: "msft"
Output: { "results": [{ "ticker": "MSFT", "name": "Microsoft", "reason": "Identified 'msft' as a ticker." }] }

Example 2:
User query: "Tata Motors"
Output: { "results": [{ "ticker": "TATAMOTORS", "name": "Tata Motors", "reason": "Identified 'Tata Motors' as a company." }] }

If no plausible ticker or company can be identified, return an empty list of results.`,
});

const searchStocksFlow = ai.defineFlow(
  {
    name: 'searchStocksFlow',
    inputSchema: SearchStocksInputSchema,
    outputSchema: SearchStocksOutputSchema,
  },
  async (input) => {
    if (!input.query) {
      return { results: [] };
    }
    try {
      const { output } = await searchStocksPrompt(input);
      return output!;
    } catch (error) {
      console.error('AI search failed:', error);
      // Return an empty result in case of an error to prevent the app from crashing.
      return { results: [] };
    }
  }
);
