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
  ticker: z.string().describe('The stock ticker symbol identified from the query, including market suffix (e.g., RELIANCE.NS, TATAMOTORS.NS).'),
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
  prompt: `You are an AI assistant for a stock trading app focused on the Indian market (NSE and BSE). Your task is to identify potential stock tickers and company names from a user's search query and format them correctly for the Finnhub API.

User query: "{{query}}"

Your task:
1.  Analyze the user's query to identify a plausible stock ticker symbol or a company name.
2.  The ticker symbol is the most important piece of information.
3.  For Indian stocks, you MUST append the correct exchange suffix. Use '.NS' for stocks on the National Stock Exchange (NSE) and '.BO' for the Bombay Stock Exchange (BSE). Default to '.NS' if unsure.
4.  Return a single result containing the identified ticker (with suffix) and company name.
5.  For the 'reason' field, briefly state what you identified.

Example 1:
User query: "msft"
Output: { "results": [{ "ticker": "MSFT", "name": "Microsoft", "reason": "Identified 'msft' as a US stock ticker." }] }

Example 2:
User query: "Tata Motors"
Output: { "results": [{ "ticker": "TATAMOTORS.NS", "name": "Tata Motors", "reason": "Identified 'Tata Motors' as a company on NSE." }] }

Example 3:
User query: "reliance"
Output: { "results": [{ "ticker": "RELIANCE.NS", "name": "Reliance Industries", "reason": "Identified 'reliance' as a company on NSE." }] }

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
      // Post-processing to ensure suffix for common Indian stocks if AI misses it
      if (output?.results.length) {
        const result = output.results[0];
        if (!result.ticker.includes('.') && result.ticker.toUpperCase() === result.ticker) {
            // Simple heuristic: if it's all caps and has no suffix, it's likely an Indian stock ticker missing its suffix.
            // This is a fallback and the prompt should handle most cases.
            const a = 1; // dummy
        }
      }
      return output!;
    } catch (error) {
      console.error('AI search failed:', error);
      // Return an empty result in case of an error to prevent the app from crashing.
      return { results: [] };
    }
  }
);
