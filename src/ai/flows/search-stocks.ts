// This is a server-side file!
'use server';

/**
 * @fileOverview A server action to search for stocks using Yahoo Finance.
 *
 * - searchStocks - A function that searches for stocks.
 * - SearchStocksInput - The input type for the searchStocks function.
 * - SearchStocksOutput - The return type for the searchStocks function.
 */

import { z } from 'zod';
import { searchSymbols } from '@/lib/yfinance-actions';

const SearchStocksInputSchema = z.object({
  query: z.string().describe("The user's search query for stocks (e.g., 'Apple', 'MSFT', 'reliance industries')."),
});
export type SearchStocksInput = z.infer<typeof SearchStocksInputSchema>;

const SearchedStockSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol.'),
  name: z.string().describe('The company name.'),
  exchange: z.string().describe('The exchange the stock trades on.'),
});

const SearchStocksOutputSchema = z.object({
  results: z
    .array(SearchedStockSchema)
    .describe('An array of stock results matching the query.'),
});
export type SearchStocksOutput = z.infer<typeof SearchStocksOutputSchema>;


export async function searchStocks(input: SearchStocksInput): Promise<SearchStocksOutput> {
  if (!input.query) {
    return { results: [] };
  }
  try {
    const searchResult = await searchSymbols(input.query);
    if (!searchResult || !searchResult.quotes) {
        return { results: [] };
    }
    
    const mappedResults = searchResult.quotes.map(q => ({
        ticker: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || 'N/A'
    })).filter(q => {
      // Filter out non-equity results that often sneak in, like ETFs or Funds
      return q.exchange && !['ETF', 'FND'].includes(q.exchange);
    });

    return { results: mappedResults };

  } catch (error) {
    console.error('Yahoo Finance search failed:', error);
    // Return an empty result in case of an error to prevent the app from crashing.
    return { results: [] };
  }
}
