'use server';

import { unstable_noStore as noStore } from 'next/cache';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

if (!FINNHUB_API_KEY) {
  console.warn('FINNHUB_API_KEY is not set. API calls will fail.');
}

async function finnhubFetch(endpoint: string, params?: Record<string, string>) {
  noStore();
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key is not configured.');
  }
  
  const queryString = new URLSearchParams({ token: FINNHUB_API_KEY, ...params }).toString();
  const url = `${BASE_URL}/${endpoint}?${queryString}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Finnhub API error (${response.status}): ${errorData.error || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from Finnhub:', error);
    throw error;
  }
}

// -------------------
// API Action Functions
// -------------------

export async function searchSymbols(query: string) {
  return finnhubFetch('search', { q: query });
}

export async function getQuote(symbol: string) {
  return finnhubFetch('quote', { symbol });
}

export async function getCompanyProfile(symbol: string) {
  return finnhubFetch('stock/profile2', { symbol });
}

export async function getCompanyNews(symbol:string, from: string, to: string) {
  return finnhubFetch('company-news', { symbol, from, to });
}

export async function getMarketNews(category: string = 'general') {
    return finnhubFetch('news', { category });
}

export async function getStockCandles(symbol: string, resolution: string, from: number, to: number) {
  return finnhubFetch('stock/candle', {
    symbol,
    resolution,
    from: from.toString(),
    to: to.toString(),
  });
}

export async function getRecommendationTrends(symbol: string) {
    return finnhubFetch('stock/recommendation', { symbol });
}
