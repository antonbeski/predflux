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

const StockInfoSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol.'),
  name: z.string().describe('The name of the company.'),
});

const SearchStocksInputSchema = z.object({
  query: z.string().describe('The user\'s search query for stocks.'),
  stocks: z.array(StockInfoSchema).describe('A list of available stocks to search from.'),
});
export type SearchStocksInput = z.infer<typeof SearchStocksInputSchema>;

const SearchedStockSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol.'),
  name: z.string().describe('The company name.'),
  reason: z.string().describe('A brief reason why this stock matches the query.'),
});

const SearchStocksOutputSchema = z.object({
  results: z.array(SearchedStockSchema).describe('An array of stock results matching the query.'),
});
export type SearchStocksOutput = z.infer<typeof SearchStocksOutputSchema>;

export async function searchStocks(input: SearchStocksInput): Promise<SearchStocksOutput> {
  return searchStocksFlow(input);
}

const searchStocksPrompt = ai.definePrompt({
  name: 'searchStocksPrompt',
  input: { schema: SearchStocksInputSchema },
  output: { schema: SearchStocksOutputSchema },
  prompt: `You are an AI assistant for a stock trading app. Your task is to help users find relevant stocks based on their search query from a predefined list.

User query: "{{query}}"

Available stocks:
{{#each stocks}}
- {{ticker}}: {{name}}
{{/each}}

Analyze the user's query and return a list of matching stocks from the available list.
For each match, provide a brief, one-sentence reason why it is relevant to the query.
If the query is a ticker or company name, return that stock.
If the query is a category (e.g., "tech stocks"), return stocks that fit that category.
If no stocks match, return an empty list.
Return a maximum of 5 results.`,
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
    const { output } = await searchStocksPrompt(input);
    return output!;
  }
);
