
'use client';

import { StockTable } from "@/components/dashboard/stock-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getQuote } from "@/lib/yfinance-actions";
import type { Stock } from "@/lib/types";
import { Quote } from "yahoo-finance2/dist/esm/src/modules/quote";

// Top 5 companies by market cap on NSE for demonstration
const popularStocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"];

async function getStockData(ticker: string): Promise<Stock | null> {
  try {
    const quote = await getQuote(ticker);
    if (!quote || typeof quote.regularMarketPrice === 'undefined') return null;
    
    const changePercent = quote.regularMarketChangePercent;
    if (typeof changePercent === 'undefined') return null;

    // This is a simplified recommendation logic for the dashboard
    const recommendation = changePercent > 0.5 ? "Buy" : changePercent < -0.5 ? "Sell" : "Hold";
    const reason = changePercent > 0.5 ? "Strong upward momentum." : changePercent < -0.5 ? "Significant downward trend." : "Stable, holding pattern.";
    
    return {
      ticker: ticker,
      name: quote.longName || quote.shortName || ticker.split('.')[0],
      exchange: quote.exchange || (ticker.endsWith('.NS') ? 'NSE' : 'BSE'),
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: changePercent,
      recommendation: recommendation,
      reason: reason,
    };
  } catch (error) {
    console.error(`Failed to fetch data for ${ticker}`, error);
    return null;
  }
}


export default function Home() {
  const [currentDate, setCurrentDate] = useState('');
  const { watchlist: watchlistItems, isLoading } = useWatchlist();
  const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [recommendationStocks, setRecommendationStocks] = useState<Stock[]>([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
  const [isRecsLoading, setIsRecsLoading] = useState(true);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));

    // Fetch popular stocks for daily recommendations
    const fetchRecs = async () => {
      setIsRecsLoading(true);
      const stockData = await Promise.all(popularStocks.map(ticker => getStockData(ticker)));
      setRecommendationStocks(stockData.filter((s): s is Stock => s !== null));
      setIsRecsLoading(false);
    }
    fetchRecs();

  }, []);

  useEffect(() => {
    // Fetch data for stocks in the watchlist
    const fetchWatchlistData = async () => {
      if (isLoading || !watchlistItems) return;
      
      setIsWatchlistLoading(true);
      if (watchlistItems.length > 0) {
        const watchlistTickers = watchlistItems.map(w => w.symbol);
        const stockData = await Promise.all(watchlistTickers.map(ticker => getStockData(ticker)));
        setWatchlistStocks(stockData.filter((s): s is Stock => s !== null));
      } else {
        setWatchlistStocks([]);
      }
      setIsWatchlistLoading(false);
    };

    fetchWatchlistData();
  }, [watchlistItems, isLoading]);


  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          AI-powered stock recommendations and your personal watchlist.
        </p>
      </header>

      <Tabs defaultValue="recommendations">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">Daily Recommendations</TabsTrigger>
          <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
        </TabsList>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Daily Market Pulse</CardTitle>
              <CardDescription>
                {currentDate ? `Popular stocks on ${currentDate}.` : 'Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRecsLoading ? (
                <p>Loading recommendations...</p>
              ) : (
                <StockTable stocks={recommendationStocks} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <CardTitle>My Watchlist</CardTitle>
              <CardDescription>
                Your tracked stocks. Add more from any stock page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isWatchlistLoading || isLoading ? (
                <p>Loading watchlist...</p>
              ) : watchlistStocks.length > 0 ? (
                <StockTable stocks={watchlistStocks} />
              ) : (
                <p className="text-center text-muted-foreground">Your watchlist is empty. Search for a stock to add it.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
