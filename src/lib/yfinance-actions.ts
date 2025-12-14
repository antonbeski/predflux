'use server';

import { unstable_noStore as noStore } from 'next/cache';
import yahooFinance from 'yahoo-finance2';
import type { NewsOptions, Quote, SearchResult } from 'yahoo-finance2/dist/esm/src/modules/quote';

// -------------------
// API Action Functions
// -------------------

export async function searchSymbols(query: string): Promise<SearchResult | undefined> {
  noStore();
  try {
    const results = await yahooFinance.search(query, { newsCount: 0 });
    return results;
  } catch (error) {
    console.error(`Search failed for query "${query}":`, error);
    return undefined;
  }
}

export async function getQuote(symbol: string): Promise<Quote | undefined> {
  noStore();
  try {
    const quote = await yahooFinance.quote(symbol);
    return quote;
  } catch (error) {
    console.error(`Failed to get quote for ${symbol}:`, error);
    return undefined;
  }
}

export async function getCompanyNews(symbol: string): Promise<NewsOptions[]> {
    noStore();
    try {
      const results = await yahooFinance.search(symbol, { newsCount: 10 });
      return results.news;
    } catch (error) {
      console.error(`Failed to fetch news for ${symbol}:`, error);
      return [];
    }
}
  

export async function getMarketNews(): Promise<NewsOptions[]> {
  noStore();
  try {
    // Using a major index as a proxy for market news
    const results = await yahooFinance.search('^NSEI', { newsCount: 50 }); // NIFTY 50
    return results.news;
  } catch (error) {
    console.error('Failed to fetch market news:', error);
    return [];
  }
}

export async function getStockCandles(symbol: string, from: Date, to: Date) {
    noStore();
    try {
        const results = await yahooFinance.historical(symbol, {
            period1: from,
            period2: to,
            interval: '1d',
        });
        return results;
    } catch (error) {
        console.error(`Failed to get candles for ${symbol}:`, error);
        return [];
    }
}
