
'use client';

import { StockTable } from "@/components/dashboard/stock-table";
import { dailyRecommendations } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [currentDate, setCurrentDate] = useState('');
  const { watchlist, isLoading } = useWatchlist();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  // For now, we are creating a "watchlist" from the daily recommendations for demonstration
  // TODO: Replace with actual watchlist data
  const watchlistStocks = dailyRecommendations.filter(stock => watchlist?.some(w => w.symbol === stock.ticker));


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
                {currentDate ? `AI-powered recommendations generated on ${currentDate}.` : 'Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockTable stocks={dailyRecommendations} />
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
              {isLoading ? (
                <p>Loading watchlist...</p>
              ) : watchlistStocks.length > 0 ? (
                <StockTable stocks={watchlistStocks} />
              ) : (
                <p className="text-center text-muted-foreground">Your watchlist is empty.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
